

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Section from "../../components/Section/Section";

import type { RootState } from "../../redux/store";

import { categoryImages } from "../../assets/images/CatImages";
import { trackBookRead } from "../../services/booksAnalytics";
import { refreshSavedBooks, toggleBookSaveState } from "../../redux/dataSlice";
import { toggleBookSave } from "../../services/dataService";
import CircleImageCard from "../../components/Cards/CircleImageCard";

interface BookItem {
    id: string;
    name: string;
    title: string;
    imageUrl: string;
    type: string;
    _id: string;
    url: string;
    category: string;
}

export default function BooksHome() {
    const navigate = useNavigate();

    const loading = useSelector((state: any) => state.data.loading);

    const [active, setActive] = useState<string>("Books");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.auth.user);
    const books = useSelector((state: RootState) => state.data.books) as BookItem[];


    const mostReadBooks = useSelector((state: RootState) => state.data.mostReadBooks);
    // const top10USA = useSelector((state: RootState) => state.data.topUSABooks);
    const savedBooks = useSelector((state: RootState) => state.data.savedBooks);
    // Categories Data
    const categories = Array.from(new Set(books.map(b => b.category))).filter(Boolean);

    const filteredCategories = categories.filter(cat =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBookClick = (book: any) => {
        // Track analytics
        trackBookRead(book.id, book.title, book.type || "Unknown");

        if (book.url) {
            window.open(book.url, "_blank");
        }
    };

    const handleToggleSave = async (item: any, isSaved: boolean) => {
        if (!user?.uid) {
            alert("Please login to save books");
            return;
        }

        // Optimistic Update
        dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));

        const success = await toggleBookSave(item.id, user.uid, isSaved);
        if (success) {
            // Refresh saved list
            dispatch(refreshSavedBooks(user.uid) as any);
        } else {
            // Revert
            dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));
            alert("Failed to save book");
        }
    };

    return (
        <div className="main-content">
            <Header
                active={active}
                setActive={setActive}
                profileOpen={profileOpen}
                setProfileOpen={setProfileOpen}
            />

            <div className="content">
                {/* Most Read Books */}
                <Section
                    title="Most Read Books"
                    onViewAll={() => navigate("/all-books")}
                    data={mostReadBooks}

                    onCardClick={handleBookClick}
                    isBook={true}
                    onToggleSave={handleToggleSave}
                    user={user}
                />


                {/* Books to Love */}
                <Section
                    title="Books to Love"
                    onViewAll={() => navigate("/all-books", { state: { filter: 'saved' } })}
                    data={savedBooks}

                    onCardClick={handleBookClick}
                    isBook={true}
                    onToggleSave={handleToggleSave}
                    user={user}
                    emptyMessage="Start saving books to see them here ❤️"
                />

                {/* Search for Books (Country Grid - Matching Channels) */}
                {/* Search for Books (Category Grid) */}
                <div className="search-radio-section">
                    <div className="search-radio-header">
                        <h2 className="sub-title">Search for Books</h2>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="podcast-category-grid">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="country-card" style={{ background: "#1a1a1a", border: "none" }}>
                                    <div className="flag-circle skeleton circle" style={{ background: "#222", border: "none" }}></div>
                                    <div className="skeleton rectangle" style={{ width: "60px", height: "12px", marginTop: "8px" }}></div>
                                </div>
                            ))
                        ) : (
                            filteredCategories.map((cat, index) => (
                                <CircleImageCard
                                    key={cat}
                                    title={cat}
                                    localImage={categoryImages[index % categoryImages.length]}
                                    onClick={() => navigate("/books-category", { state: { category: cat } })}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
