import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Card from "../../components/Cards/Card";
import type { RootState } from "../../redux/store";

export default function AllBooks() {
    const navigate = useNavigate();
    const location = useLocation();
    const categoryFilter = location.state?.category;

    const books = useSelector((state: RootState) => state.data.books);
    const [active, setActive] = useState<string>("Books");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState("");

    const displayBooks = categoryFilter
        ? books.filter((b: any) => b.category === categoryFilter)
        : books;

    const filteredBooks = displayBooks.filter((b: any) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBookClick = (book: any) => {
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
                <div className="top-bar">
                    <h2 className="sub-title">{categoryFilter ? `${categoryFilter} Books` : "All Books"}</h2>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="card-grid">
                    {filteredBooks.map((book: any) => (
                        <Card
                            key={book.id}
                            item={book}
                            onClick={handleBookClick}
                        />
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
