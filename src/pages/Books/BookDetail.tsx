
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import BookCard from "../../components/Cards/BookCard";
import "./BookDetail.css";
import type { RootState } from "../../redux/store";
import { trackBookRead } from "../../services/booksAnalytics";
import { toggleBookSave } from "../../services/dataService";
import { refreshSavedBooks, toggleBookSaveState } from "../../redux/dataSlice";
import { images } from "../../assets/images";
import usePageTitle from "../../hooks/usePageTitle";

export default function BookDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [active, setActive] = useState("Books");
    const [profileOpen, setProfileOpen] = useState(false);

    const { books } = useSelector((state: RootState) => state.data);
    const user = useSelector((state: RootState) => state.auth.user);
    const book = books.find((b: any) => b.id === id);

    usePageTitle(book ? book.title : "Book Detail");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!book) {
        return (
            <div className="main-content">
                <Header active={active} setActive={setActive} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />
                <div className="book-detail-container">
                    <h2>Book not found</h2>
                    <button className="btn-secondary" onClick={() => navigate("/books")}>Back to Books</button>
                </div>
                <Footer />
            </div>
        );
    }

    const recommendedBooks = books
        .filter((b: any) => b.category === book.category && b.id !== book.id)
        ;

    const isSaved = book.star?.includes(user?.uid);

    const handleReadNow = () => {
        trackBookRead(book.id, book.title, book.type || "Unknown");
        if (book.url) {
            window.open(book.url, "_blank");
        }
    };

    const handleToggleSave = async () => {
        if (!user?.uid) {
            alert("Please login to save books");
            return;
        }

        dispatch(toggleBookSaveState({ bookId: book.id, userId: user.uid }));
        const success = await toggleBookSave(book.id, user.uid, isSaved);
        if (success) {
            dispatch(refreshSavedBooks(user.uid) as any);
        } else {
            dispatch(toggleBookSaveState({ bookId: book.id, userId: user.uid }));
            alert("Failed to save book");
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/api/share?type=book&id=${encodeURIComponent(book.id)}`;
        const shareData = {
            title: book.title,
            text: `Check out "${book.title}" on JesusPOD`,
            url: shareUrl,
        };

        if (navigator.share) {
            navigator.share(shareData).catch((err) => console.log("Share cancelled", err));
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="main-content">
            <Header active={active} setActive={setActive} profileOpen={profileOpen} setProfileOpen={setProfileOpen} />

            <div className="book-detail-container">
                <div className="book-detail-main">
                    <div className="book-detail-left">
                        <div className="book-detail-image-wrapper">
                            <img src={book.imageUrl || book.thumbnail} alt={book.title} className="book-detail-image" />
                        </div>
                    </div>

                    <div className="book-detail-right">
                        <h1 className="book-detail-title">{book.title}</h1>
                        <p className="book-detail-author">{book.name || "Author Name"}</p>
                        <p className="book-detail-description">
                            {book.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                        </p>

                        <div className="book-detail-actions">
                            <button className="btn-primary" onClick={handleReadNow}>
                                Read Now
                            </button>
                            <button className={`btn-secondary ${isSaved ? 'active' : ''}`} onClick={handleToggleSave}>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill={isSaved ? "#fb4a4a" : "none"}
                                    stroke={isSaved ? "#fb4a4a" : "#fff"}
                                    strokeWidth="2"
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {isSaved ? "Liked" : "Like"}
                            </button>
                            <button className="btn-secondary" onClick={handleShare}>
                                <img src={images.share} alt="share" style={{ width: 20, height: 20, filter: 'brightness(0) invert(1)' }} />
                                Share
                            </button>
                        </div>
                    </div>
                </div>

                {recommendedBooks.length > 0 && (
                    <div className="recommended-section">
                        <div className="recommended-header">
                            <h2 className="recommended-title">Recommended Books</h2>
                            <button className="view-all-link" onClick={() => navigate("/all-books", { state: { category: book.category } })}>
                                View All
                            </button>
                        </div>
                        <div className="recommended-scroll-wrapper">
                            <div className="recommended-horizontal-grid">
                                {recommendedBooks.map((item: any) => (
                                    <BookCard
                                        key={item.id}
                                        item={item}
                                        onClick={() => navigate(`/book/${item.id}`)}
                                        isSaved={item.star?.includes(user?.uid)}
                                        onToggleSave={(i, s) => {
                                            if (!user?.uid || !i.id) {
                                                if (!user?.uid) alert("Please login to save books");
                                                return;
                                            }
                                            dispatch(toggleBookSaveState({ bookId: i.id as string, userId: user.uid as string }));
                                            toggleBookSave(i.id as string, user.uid as string, s).then(res => {
                                                if (res) dispatch(refreshSavedBooks(user.uid as string) as any);
                                                else dispatch(toggleBookSaveState({ bookId: i.id as string, userId: user.uid as string }));
                                            });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
