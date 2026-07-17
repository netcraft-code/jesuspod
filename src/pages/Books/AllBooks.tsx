import { useState } from "react";

import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import BookCard from "../../components/Cards/BookCard";
import "../Radio/Radio.css"; // Reuse Radio/Channel CSS
import { useSelector, useDispatch } from "react-redux";
import { trackBookRead } from "../../services/booksAnalytics";
import { toggleBookSave } from "../../services/dataService";
import { getFilteredBooks, refreshSavedBooks, toggleBookSaveState } from "../../redux/dataSlice";
import type { RootState } from "../../redux/store";
import { images } from "../../assets/images";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase";

import { useTranslation } from "../../context/LanguageContext";

export default function AllBooks() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Priority: 1. URL Param, 2. State
    const categoryParam = searchParams.get("category");
    const categoryFromState = location.state?.category;
    const activeCategory = categoryParam || categoryFromState;
    const filterFromQuery = searchParams.get("filter");
    const filterState = filterFromQuery || location.state?.filter;

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
    // const filterState = location.state?.filter; // Moved up


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
    } else if (activeCategory) {
        sourceBooks = allBooks.filter((b: any) => b.category === activeCategory);
    }

    // Local Search & Sort
    const filtered = sourceBooks
        .filter((b: any) =>
            b.title?.toLowerCase().includes(search.toLowerCase()) ||
            b.name?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a: any, b: any) => {
            const titleA = (a.title || a.name || "").toLowerCase();
            const titleB = (b.title || b.name || "").toLowerCase();
            return titleA.localeCompare(titleB);
        });

    const handleBookClick = (book: any) => {
        trackBookRead(book.id, book.title, book.type || "Unknown");
        navigate(`/book/${book.id}`);
    };

    const handleToggleSave = async (item: any, isSaved: boolean) => {
        if (!user?.uid) {
            alert(t("books.pleaseLogin"));
            return;
        }

        dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));

        const success = await toggleBookSave(item.id, user.uid, isSaved);
        if (success) {
            dispatch(refreshSavedBooks(user.uid) as any);
        } else {
            dispatch(toggleBookSaveState({ bookId: item.id, userId: user.uid }));
            alert(t("books.failedSave"));
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
                            ? t("books.booksToLove")
                            : (countryFromState ? `${countryFromState} ${t("books.allBooks")}` : (activeCategory ? `${activeCategory} ${t("books.allBooks")}` : t("books.allBooks")))
                        }
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            className="share-btn"
                            onClick={() => {
                                const shareUrl = window.location.href;
                                if (navigator.share) {
                                    navigator.share({
                                        title: `JesusPOD ${t("header.books") || t("books.allBooks")}`,
                                        url: shareUrl,
                                    }).then(() => {
                                        logEvent(analytics, "Share_AllBooks", { filter: filterState || activeCategory || "all" });
                                    });
                                } else {
                                    navigator.clipboard.writeText(shareUrl);
                                    alert(t("books.linkCopied"));
                                }
                            }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fb4a4a';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <img src={images.share} alt="share" style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} />
                        </button>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t("books.searchPlaceholderAll")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
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
