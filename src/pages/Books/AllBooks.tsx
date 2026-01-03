import { useState } from "react";

import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import BookCard from "../../components/Cards/BookCard";
import "../Radio/Radio.css"; // Reuse Radio/Channel CSS
import { useSelector, useDispatch } from "react-redux";
import { trackBookRead } from "../../services/booksAnalytics";
import { toggleBookSave } from "../../services/dataService";
import { getFilteredBooks, refreshSavedBooks, toggleBookSaveState } from "../../redux/dataSlice";
import type { RootState } from "../../redux/store";

export default function AllBooks() {
    // const navigate = useNavigate();
    const location = useLocation();
    const categoryFilter = location.state?.category;

    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.auth.user);

    // 1. Get ALL books
    const allBooks = useSelector((state: RootState) => state.data.books);
    const savedBooks = useSelector((state: RootState) => state.data.savedBooks);

    // 2. Get Redux filtered books (Global fallback)
    const reduxFilteredBooks = useSelector(getFilteredBooks);

    const [active, setActive] = useState<string>("Books");
    const [profileOpen, setProfileOpen] = useState<boolean>(false);
    const [search, setSearch] = useState("");

    // 3. Determine source
    const countryFromState = location.state?.country;
    const filterState = location.state?.filter;


    let sourceBooks = reduxFilteredBooks;

    if (filterState === 'saved') {
        sourceBooks = savedBooks;
    } else if (countryFromState) {
        if (countryFromState === "Global") {
            sourceBooks = allBooks;
        } else {
            sourceBooks = allBooks.filter((b: any) =>
                b.type?.toLowerCase() === countryFromState.toLowerCase()
            );
        }
    } else if (categoryFilter) {
        sourceBooks = allBooks.filter((b: any) => b.category === categoryFilter);
    }

    // Local Search
    const filtered = sourceBooks.filter((b: any) =>
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleBookClick = (book: any) => {
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

        dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));

        const success = await toggleBookSave(item.id, user.uid, isSaved);
        if (success) {
            dispatch(refreshSavedBooks(user.uid) as any);
        } else {
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
                <div className="top-bar">
                    <h2 className="sub-title">
                        {filterState === 'saved'
                            ? "Books to Love"
                            : (countryFromState ? `${countryFromState} Books` : (categoryFilter ? `${categoryFilter} Books` : "All Books"))
                        }
                    </h2>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for books..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="book-grid">
                    {filtered.map((book: any) => (
                        <BookCard
                            key={book.id}
                            item={book}
                            onClick={handleBookClick}
                            isSaved={book.star?.includes(user?.uid)}
                            onToggleSave={handleToggleSave}
                        />
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
}
