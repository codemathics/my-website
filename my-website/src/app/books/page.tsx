"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import BookModal from "@/components/BookModal";

export interface BookEntry {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  link?: string;
  buyLink?: string;
  summary?: string;
  status: "read" | "reading" | "to-read";
}

// Book cards from Figma (Codemathics Design Playground) — titles are on the card images
const books: BookEntry[] = [
  {
    id: "1",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    description: "",
    coverImage: "/books/book1.png",
    status: "read",
    summary: "Key lessons on how design shapes behaviour: affordances, signifiers, mapping and feedback. A foundational read for anyone in product or design.",
    buyLink: "https://www.amazon.com/Design-Everyday-Things-Revised-Expanded/dp/0465050654",
  },
  { id: "2", title: "Book 2", author: "", description: "", coverImage: "/books/book2.png", status: "read" },
  { id: "3", title: "Book 3", author: "", description: "", coverImage: "/books/book3.png", status: "read" },
  { id: "4", title: "Book 4", author: "", description: "", coverImage: "/books/book4.png", status: "reading" },
  { id: "5", title: "Book 5", author: "", description: "", coverImage: "/books/book5.png", status: "reading" },
  { id: "6", title: "Book 6", author: "", description: "", coverImage: "/books/book6.png", status: "read" },
  { id: "7", title: "Book 7", author: "", description: "", coverImage: "/books/book7.png", status: "read" },
  { id: "8", title: "Book 8", author: "", description: "", coverImage: "/books/book8.png", status: "read" },
  { id: "9", title: "Book 9", author: "", description: "", coverImage: "/books/book9.png", status: "read" },
];

const statusLabel: Record<BookEntry["status"], string> = {
  read: "read",
  reading: "reading",
  "to-read": "to read",
};

export default function BooksPage() {
  const [selectedBook, setSelectedBook] = useState<BookEntry | null>(null);
  const [clickIndicator, setClickIndicator] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const openModal = useCallback((book: BookEntry) => {
    setSelectedBook(book);
  }, []);
  const closeModal = useCallback(() => setSelectedBook(null), []);

  return (
    <div className="books-page">
      <Navbar showLogo={true} showNav={true} />
      <main className="books-main">
        <header className="books-header">
          <h1 className="books-title">my books</h1>
          <p className="books-subtitle">
            what i&apos;ve read and i&apos;m reading about design, product, ai, stablecoins, filmmaking and
            creativity. i&apos;m always looking for new books to read, so feel free to recommend me one.
          </p>
        </header>
        <div className="books-grid">
          {books.map((book) => (
            <article
              key={book.id}
              className={`books-card ${hoveredCardId === book.id ? "books-card-cursor-active" : ""}`}
              onPointerEnter={(e) => {
                setHoveredCardId(book.id);
                setClickIndicator({ visible: true, x: e.clientX, y: e.clientY });
              }}
              onPointerLeave={() => {
                setHoveredCardId(null);
                setClickIndicator((p) => ({ ...p, visible: false }));
              }}
              onPointerMove={(e) => {
                if (hoveredCardId === book.id) {
                  setClickIndicator((p) => ({ ...p, x: e.clientX, y: e.clientY, visible: true }));
                }
              }}
              onClick={() => openModal(book)}
            >
              <div className="books-card-image-wrap">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  width={400}
                  height={560}
                  className="books-card-image"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <span
                  className={`books-card-status books-card-status-${book.status}`}
                >
                  {statusLabel[book.status]}
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* custom click cursor on cards */}
      <div
        className={`showcase-click-cursor ${clickIndicator.visible ? "visible" : ""}`}
        style={{
          left: clickIndicator.x,
          top: clickIndicator.y,
        }}
        aria-hidden="true"
      >
        <img
          src="/click-icon.svg"
          alt=""
          width={116}
          height={116}
          className="showcase-click-cursor-icon"
        />
      </div>

      <BookModal book={selectedBook} onClose={closeModal} />
    </div>
  );
}
