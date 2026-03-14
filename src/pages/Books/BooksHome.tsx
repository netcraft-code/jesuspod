
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import HomeSection from "../../components/HomeSection/HomeSection";

import type { RootState } from "../../redux/store";

import { categoryImages } from "../../assets/images/CatImages";
import { trackBookRead } from "../../services/booksAnalytics";
import { refreshSavedBooks, toggleBookSaveState } from "../../redux/dataSlice";
import { toggleBookSave } from "../../services/dataService";
import CircleImageCard from "../../components/Cards/CircleImageCard";
import usePageTitle from "../../hooks/usePageTitle";
import { images } from "../../assets/images";
import PageInfo from "../../components/UI/PageInfo";

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
    usePageTitle("Books")
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.auth.user);
    const books = useSelector((state: RootState) => state.data.books) as BookItem[];


    const mostReadBooks = useSelector((state: RootState) => state.data.mostReadBooks);
    // const top10USA = useSelector((state: RootState) => state.data.topUSABooks);
    const savedBooks = useSelector((state: RootState) => state.data.savedBooks);
    // Categories Data
    const categories = Array.from(new Set(books.map(b => b.category))).filter(Boolean).sort((a, b) => a.localeCompare(b));

    // --- GLOBAL SEARCH FILTERING ---
    const filteredMostRead = mostReadBooks.filter((book: any) =>
        book.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSaved = savedBooks.filter((book: any) =>
        book.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // const filteredCategories = categories.filter(cat =>
    //     cat.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const handleBookClick = (book: any) => {
        // Track analytics
        trackBookRead(book.id, book.title, book.type || "Unknown");
        navigate(`/book/${book.id}`);
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


    const handleSharePage = () => {
        const shareData = {
            title: "Jesus Pod - Books",
            text: "Check out the latest books on Jesus Pod!",
            url: window.location.href,
        };

        if (navigator.share) {
            navigator.share(shareData).catch((err) => console.log("Share cancelled", err));
        } else {
            navigator.clipboard.writeText(shareData.url);
            alert("Link copied to clipboard!");
        }
    };

    const handleCategoryShare = (categoryName: string) => {
        const shareUrl = `${window.location.origin}/all-books?category=${encodeURIComponent(categoryName)}`;
        const shareData = {
            title: `${categoryName} Books`,
            text: `Check out these ${categoryName} books on Jesus Pod!`,
            url: shareUrl,
        };

        if (navigator.share) {
            navigator.share(shareData).catch((err) => console.log("Share cancelled", err));
        } else {
            navigator.clipboard.writeText(shareData.url);
            alert("Link copied to clipboard!");
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
                {/* Header Row: Page Info + Search/Share */}
                <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <PageInfo
                            title="Strengthen Your Walk with Books"
                            description="Deepen your understanding of God through a library of books covering every area of life. With ten focused categories; including Prayer, Revival, History, and Missions, you have the tools to build your faith in any season. These books are selected to give you biblical depth and practical wisdom for your daily journey with Christ."
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                        <button
                            className="share-btn"
                            onClick={handleSharePage}
                            title="Share Podcast Page"
                        >
                            <img src={images.share} alt="share" />
                            <span>Share</span>
                        </button>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search for books..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setSearchTerm(e.target.value)
                            }
                            style={{ width: '100%', maxWidth: '300px' }}
                        />
                    </div>
                </div>


                {/* Most Read Books */}
                {filteredMostRead.length > 0 && (
                    <HomeSection
                        title="Most Read Books"
                        onViewAll={() => navigate("/all-books")}
                        data={filteredMostRead}
                        loading={loading}
                        onCardClick={handleBookClick}
                        isBook={true}
                        onToggleSave={handleToggleSave}
                        user={user}
                    />
                )}

                {/* My Books (Moved & Renamed) */}
                {filteredSaved.length > 0 && (
                    <HomeSection
                        title="My Books"
                        onViewAll={() => navigate("/all-books?filter=saved")}
                        data={filteredSaved}
                        loading={loading}
                        onCardClick={handleBookClick}
                        isBook={true}
                        onToggleSave={handleToggleSave}
                        user={user}
                        emptyMessage="Start saving books to see them here ❤️"
                    />
                )}


                {/* Categorized Book Sections */}
                {categories.map((category: any) => {
                    const categoryBooks = books.filter((b: any) =>
                        b.category === category &&
                        (!searchTerm || b.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).sort((a: any, b: any) => (a.title || "").localeCompare(b.title || ""));

                    if (categoryBooks.length === 0) return null;

                    return (
                        <div key={category} style={{ marginBottom: '40px' }}>
                            <HomeSection
                                title={category.toUpperCase()}
                                onViewAll={() => navigate(`/all-books?category=${encodeURIComponent(category)}`)}
                                data={categoryBooks}
                                loading={loading}
                                onCardClick={handleBookClick}
                                isBook={true}
                                onToggleSave={handleToggleSave}
                                user={user}
                            />
                        </div>
                    );
                })}



                {/* Search for Books (Country Grid - Matching Channels) */}
                {/* Search for Books (Category Grid) */}
                <div className="search-radio-section">
                    <div className="search-radio-header">
                        <h2 className="sub-title">Books Categories</h2>

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
                            categories.map((cat, index) => (
                                <CircleImageCard
                                    key={cat}
                                    title={cat}
                                    localImage={categoryImages[index % categoryImages.length]}
                                    onClick={() => navigate(`/all-books?category=${encodeURIComponent(cat)}`)}
                                    onShare={() => handleCategoryShare(cat)}
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
