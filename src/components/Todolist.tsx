import { useEffect, useState } from "react";
import axios from "axios";

interface Article {
  id: number;
  title: string;
  image: string;
  date: string; // Adjusted to match db.json structure
  status: string;
}

export default function ArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [newArticle, setNewArticle] = useState<{
    title: string;
    image: string;
    date: string; // Adjusted to match db.json structure
  }>({
    title: "",
    image: "",
    date: "",
  });
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showResetFormConfirm, setShowResetFormConfirm] =
    useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const fetchData = () => {
    axios
      .get(`http://localhost:3000/posts?title_like=${searchQuery}`)
      .then((response) => setArticles(response.data))
      .catch((error) => console.error("An error occurred.", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const handleBlockToggle = (article: Article) => {
    setCurrentArticle(article);
    setShowBlockModal(true);
  };

  const handleCancelBlock = () => {
    setShowBlockModal(false);
    setCurrentArticle(null);
  };

  const handleConfirmBlock = () => {
    if (!currentArticle) return;

    const newStatus =
      currentArticle.status === "Ngừng xuất bản"
        ? "Đã xuất bản"
        : "Ngừng xuất bản";

    axios
      .patch(`http://localhost:3000/posts/${currentArticle.id}`, {
        status: newStatus,
      })
      .then(() => {
        const updatedArticles = articles.map((item) =>
          item.id === currentArticle.id ? { ...item, status: newStatus } : item
        );
        setArticles(updatedArticles);
        setShowBlockModal(false);
        setCurrentArticle(null);
      })
      .catch((error) => console.error("An error occurred.", error));
  };

  const handleCreateArticleClick = () => {
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleResetForm = () => {
    setShowResetFormConfirm(true);
  };

  const confirmResetForm = () => {
    setNewArticle({ title: "", image: "", date: "" });
    setShowResetFormConfirm(false);
  };

  const handlePublishArticle = () => {
    setErrorMsg("");

    if (!newArticle.title || !newArticle.image || !newArticle.date) {
      setErrorMsg("Title, image, and creation date cannot be empty");
      return;
    }

    if (articles.some((article) => article.title === newArticle.title)) {
      setErrorMsg("Article title must be unique");
      return;
    }

    axios
      .post("http://localhost:3000/posts", {
        ...newArticle,
        status: "Đã xuất bản",
      })
      .then((response) => {
        setArticles([...articles, response.data]);
        setShowCreateForm(false);
        setNewArticle({ title: "", image: "", date: "" });
      })
      .catch((error) => console.error("An error occurred.", error));
  };

  const handleDeleteArticle = (article: Article) => {
    setArticleToDelete(article);
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setArticleToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!articleToDelete) return;

    axios
      .delete(`http://localhost:3000/posts/${articleToDelete.id}`)
      .then(() => {
        const updatedArticles = articles.filter(
          (item) => item.id !== articleToDelete.id
        );
        setArticles(updatedArticles);
        setShowDeleteConfirm(false);
        setArticleToDelete(null);
      })
      .catch((error) => console.error("An error occurred.", error));
  };

  return (
    <>
      <div className="article-container my-3">
        <div className="d-flex justify-content-between">
          <div className="d-flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search keywords"
            />
            <select>
              <option value="all">Filter articles</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCreateArticleClick}
          >
            Add new article
          </button>
        </div>
        <div className="table-wrapper">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Index</th>
                <th>Title</th>
                <th>Image</th>
                <th>Creation Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, index) => (
                <tr key={article.id}>
                  <td>{index + 1}</td>
                  <td>{article.title}</td>
                  <td>
                    <img
                      className="img-fluid"
                      style={{ width: "150px", height: "80px" }}
                      src={article.image}
                      alt={article.title}
                    />
                  </td>
                  <td>{article.date}</td>
                  <td>
                    <span
                      className={`status ${
                        article.status === "Ngừng xuất bản"
                          ? "blocked"
                          : "published"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleBlockToggle(article)}
                    >
                      Block
                    </button>
                    <button className="btn btn-warning mx-2">Edit</button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteArticle(article)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showBlockModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirmation</h2>
            <p>
              Are you sure you want to{" "}
              {currentArticle?.status === "Ngừng xuất bản"
                ? "publish this article?"
                : "unpublish this article?"}
            </p>
            <button
              className="btn btn-primary mb-2"
              onClick={handleCancelBlock}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleConfirmBlock}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-icon" onClick={handleCloseCreateForm}>
              &times;
            </button>
            <h2>Add new article</h2>
            <label>
              Title:
              <input
                type="text"
                value={newArticle.title}
                onChange={(e) =>
                  setNewArticle({ ...newArticle, title: e.target.value })
                }
              />
            </label>
            <label>
              Image:
              <input
                type="text"
                value={newArticle.image}
                onChange={(e) =>
                  setNewArticle({ ...newArticle, image: e.target.value })
                }
              />
            </label>
            <label>
              Creation Date:
              <input
                type="date"
                value={newArticle.date}
                onChange={(e) =>
                  setNewArticle({ ...newArticle, date: e.target.value })
                }
              />
            </label>
            {errorMsg && <p className="error">{errorMsg}</p>}
            <button className="btn border mb-2" onClick={handleResetForm}>
              Reset
            </button>
            <button className="btn btn-primary" onClick={handlePublishArticle}>
              Publish
            </button>
          </div>
        </div>
      )}

      {showResetFormConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirmation</h2>
            <p>Are you sure you want to reset all input values?</p>
            <button
              className="btn btn-primary mb-2"
              onClick={() => setShowResetFormConfirm(false)}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmResetForm}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirmation</h2>
            <p>Are you sure you want to delete this article?</p>
            <button
              className="btn btn-primary mb-2"
              onClick={handleCancelDelete}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleConfirmDelete}>
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
}
