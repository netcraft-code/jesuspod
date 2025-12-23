import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Section from "../../components/Section/Section";
import CircleImageCard from "../../components/Cards/CircleImageCard";
import type { RootState } from "../../redux/store";
import { categoryImages } from "../../assets/images/CatImages";

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
    const books = useSelector((state: RootState) => state.data.books) as BookItem[];
    const loading = useSelector((state: any) => state.data.loading);

    const [active, setActive] = useState<string>("Books");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Split books into sections (using dummy logic for now)
    const mostReadBooks = books.slice(0, 10);
    const top10USA = books.slice(10, 20);
    const booksToLove = books.slice(20, 30);

    // Get unique categories
    const categories = Array.from(new Set(books.map(b => b.category))).filter(Boolean);

    const filteredCategories = categories.filter(cat =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBookClick = (book: BookItem) => {
        if (book.url) {
            window.open(book.url, "_blank");
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
                />

                {/* Top 10 in the US */}
                <Section
                    title="Top 10 in the US"
                    onViewAll={() => navigate("/all-books")}
                    data={top10USA}

                    onCardClick={handleBookClick}
                />

                {/* Books to Love */}
                <Section
                    title="Books to Love"
                    onViewAll={() => navigate("/all-books")}
                    data={booksToLove}

                    onCardClick={handleBookClick}
                />

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
