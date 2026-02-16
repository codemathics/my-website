"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { BookEntry } from "@/app/books/page";

interface BookModalProps {
  book: BookEntry | null;
  onClose: () => void;
}

export default function BookModal({ book, onClose }: BookModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (book) {
      setIsVisible(true);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShowContent(true));
      });
      return () => cancelAnimationFrame(t);
    } else {
      setShowContent(false);
      const t = setTimeout(() => setIsVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [book]);

  const handleClose = useCallback(() => {
    setShowContent(false);
    const t = setTimeout(onClose, 350);
    return () => clearTimeout(t);
  }, [onClose]);

  useEffect(() => {
    if (!book) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [book, handleClose]);

  if (!book) return null;

  return (
    <div
      className={`book-modal-overlay ${showContent ? "visible" : ""}`}
      onClick={handleClose}
      aria-hidden="true"
    >
      <div
        className={`book-modal-panel ${isVisible ? "visible" : ""} ${showContent ? "content-visible" : ""}`}
        aria-modal="true"
        role="dialog"
        aria-labelledby="book-modal-title"
      >
        <button
          type="button"
          className={`book-modal-close ${showContent ? "visible" : ""}`}
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
        <div
          className={`book-modal-content ${showContent ? "visible" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="book-modal-title" className="book-modal-title">
            {book.title}
          </h2>
          <p className="book-modal-notice">
            book summary and learnings are coming soon—watch out for it.
          </p>
          {(book.summary || book.description) && (
            <div className="book-modal-summary">
              <p>{book.summary || book.description}</p>
            </div>
          )}
          {(book.buyLink ?? book.link) && (
            <a
              href={book.buyLink ?? book.link}
              target="_blank"
              rel="noopener noreferrer"
              className="book-modal-cta"
            >
              Buy / View book
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
