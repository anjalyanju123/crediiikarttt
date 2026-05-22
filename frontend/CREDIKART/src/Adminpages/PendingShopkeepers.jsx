import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./PendingShopkeepers.css";
import Sidebar from "./Sidebar";
import Modal from "react-modal";

Modal.setAppElement("#root");
export default function PendingShopkeepers() {

  const [shopkeepers, setShopkeepers] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");

  useEffect(() => {
    fetchShopkeepers();
  }, []);

  const fetchShopkeepers = async () => {

    try {

      const response = await api.get(
        "/pending_shopkeepers/"
      );
      setShopkeepers(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  const approveShopkeeper = async (id) => {

    try {

      await api.patch(
        `/approve_shopkeeper/${id}/`
      );

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
 return (
  <div className="pending-container">

    <Sidebar />

    <div className="pending-content">

      <h1>Pending Shopkeepers</h1>

      <div className="shopkeeper-grid">

        {shopkeepers.map((shopkeeper) => (

          <div
            className="shopkeeper-card"
            key={shopkeeper.id}
          >

            <h2>{shopkeeper.shop_name}</h2>

            <p>
              <strong>Owner:</strong>{" "}
              {shopkeeper.username}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {shopkeeper.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {shopkeeper.phone}
            </p>

            <p>
              <strong>Shop Type:</strong>{" "}
              {shopkeeper.shop_type}
            </p>

            <p>
              <strong>GST:</strong>{" "}
              {shopkeeper.gst_number}
            </p>

            {/* DOCUMENT BUTTONS */}
            <div className="document-links">

              <button
                onClick={() =>
                  openDocument(shopkeeper.gst_document)
                }
              >
                View GST
              </button>

              <button
                onClick={() =>
                  openDocument(shopkeeper.license_document)
                }
              >
                View License
              </button>

            </div>

            {/* APPROVE BUTTON */}
            <button
              className="approve-btn"
              onClick={() =>
                approveShopkeeper(shopkeeper.id)
              }
            >
              Approve
            </button>

          </div>
        ))}

      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="document-modal"
        overlayClassName="modal-overlay"
      >

        <button
          className="close-btn"
          onClick={() => setModalOpen(false)}
        >
          ✕
        </button>

        {selectedDocument?.toLowerCase().includes(".pdf") ? (

          <div className="pdf-preview">

            <p>PDF preview blocked.</p>

            <a
              href={selectedDocument}
              target="_blank"
              rel="noreferrer"
              className="open-pdf-btn"
            >
              Open PDF
            </a>

          </div>

        ) : (

          <img
            src={selectedDocument}
            alt="document"
            className="preview-image"
          />

        )}

      </Modal>

    </div>

  </div>
);
}