import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "./Sidebar";
import Modal from "react-modal";
import "./Shopkeepers.css";

Modal.setAppElement("#root");

export default function Shopkeepers() {

  const [shopkeepers, setShopkeepers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");

  useEffect(() => {
    fetchShopkeepers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOrder]);

  const fetchShopkeepers = async () => {
    try {
      const response = await api.get("/shopkeepers_list/");
      setShopkeepers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const approveShopkeeper = async (id) => {
    try {
      await api.patch(`/approve_shopkeeper/${id}/`);
      fetchShopkeepers();
    } catch (error) {
      console.log(error);
    }
  };

  const rejectShopkeeper = async (id) => {
    try {
      await api.delete(`/reject_shopkeeper/${id}/`);
      fetchShopkeepers();
    } catch (error) {
      console.log(error);
    }
  };

  const openDocument = (doc) => {
    if (!doc) return alert("Document not uploaded");
    setSelectedDocument(doc);
    setModalOpen(true);
  };

  const filteredData = shopkeepers
    .filter((s) => {
      const searchMatch =
        s.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.shop_type.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        statusFilter === "all"
          ? true
          : statusFilter === "approved"
            ? s.is_approved === true
            : s.is_approved === false;

      return searchMatch && statusMatch;
    })
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
    );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="shopkeepers-page">

      <Sidebar />

      <div className="shopkeepers-container">

        <h1>All Shopkeepers</h1>

        {/* FILTERS */}
        <div className="filters">

          <input
            type="text"
            placeholder="Search shop, owner, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

        </div>

        {/* TABLE LIST */}
        <div className="shopkeepers-list">

          {/* HEADER */}
          <div className="shopkeepers-header">
            <span>Shop Name</span>
            <span>Owner</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Status</span>
            <span>Type</span>
            <span>Gst Document</span>
            <span>License Document</span>
            <span>Action</span>
          </div>

          {/* ROWS */}
          {currentItems.map((s) => (
            <div className="shopkeeper-row" key={s.id}>

              <span>{s.shop_name}</span>
              <span>{s.username}</span>
              <span>{s.email}</span>
              <span>{s.phone}</span>

              <span className={s.is_approved ? "status-approved" : "status-rejected"}>
                {s.is_approved ? "Approved" : "Rejected"}
              </span>

              <span>{s.shop_type}</span>

              <span>
                <button onClick={() => openDocument(s.gst_document)}>
                  View GST
                </button>
              </span>

              <span>
                <button onClick={() => openDocument(s.license_document)}>
                  View License
                </button>
              </span>

              <div className="row-actions">

                {!s.is_approved ? (
                  <button
                    className="approve-btn"
                    onClick={() => approveShopkeeper(s.id)}
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    className="reject-btn"
                    onClick={() => rejectShopkeeper(s.id)}
                  >
                    Reject
                  </button>
                )}

              </div>

            </div>
          ))}

        </div>

        {/* PAGINATION */}
        <div className="pagination">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>

        </div>

        {/* MODAL */}
        <Modal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          className="document-modal"
          overlayClassName="modal-overlay"
        >
          <button className="close-btn" onClick={() => setModalOpen(false)}>✕</button>

          {selectedDocument?.toLowerCase().includes(".pdf") ? (
            <div className="pdf-preview">
              <p>PDF preview blocked.</p>
              <a href={selectedDocument} target="_blank" rel="noreferrer" className="open-pdf-btn">
                Open PDF
              </a>
            </div>
          ) : (
            <img src={selectedDocument} alt="doc" className="preview-image" />
          )}
        </Modal>

      </div>
    </div>
  );
}