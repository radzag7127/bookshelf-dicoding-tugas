import Hapi from "@hapi/hapi";
import { nanoid } from "nanoid";
import books from "./books.js";

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: "localhost",
  });

  server.route([
    {
      method: "POST",
      path: "/books",
      handler: (request, h) => {
        const {
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
        } = request.payload;

        if (!name) {
          return h
            .response({
              status: "fail",
              message: "Gagal menambahkan buku. Mohon isi nama buku",
            })
            .code(400);
        }

        if (readPage > pageCount) {
          return h
            .response({
              status: "fail",
              message:
                "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
            })
            .code(400);
        }

        const id = nanoid(16);
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;
        const finished = pageCount === readPage;

        const newBook = {
          id,
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          finished,
          reading,
          insertedAt,
          updatedAt,
        };

        books.push(newBook);

        return h
          .response({
            status: "success",
            message: "Buku berhasil ditambahkan",
            data: {
              bookId: id,
            },
          })
          .code(201);
      },
    },
    {
      method: "GET",
      path: "/books",
      handler: (request, h) => {
        const { name, reading, finished } = request.query;
        let filteredBooks = books;

        if (name) {
          filteredBooks = filteredBooks.filter((book) =>
            book.name.toLowerCase().includes(name.toLowerCase())
          );
        }

        if (reading !== undefined) {
          filteredBooks = filteredBooks.filter(
            (book) => book.reading === !!Number(reading)
          );
        }

        if (finished !== undefined) {
          filteredBooks = filteredBooks.filter(
            (book) => book.finished === !!Number(finished)
          );
        }

        const response = {
          status: "success",
          data: {
            books: filteredBooks.map((book) => ({
              id: book.id,
              name: book.name,
              publisher: book.publisher,
            })),
          },
        };
        return h.response(response).code(200);
      },
    },
    {
      method: "GET",
      path: "/books/{bookId}",
      handler: (request, h) => {
        const { bookId } = request.params;
        const book = books.find((b) => b.id === bookId);

        if (!book) {
          return h
            .response({
              status: "fail",
              message: "Buku tidak ditemukan",
            })
            .code(404);
        }

        return h
          .response({
            status: "success",
            data: {
              book,
            },
          })
          .code(200);
      },
    },
    {
      method: "PUT",
      path: "/books/{bookId}",
      handler: (request, h) => {
        const { bookId } = request.params;
        const {
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
        } = request.payload;
        const updatedAt = new Date().toISOString();

        if (!name) {
          return h
            .response({
              status: "fail",
              message: "Gagal memperbarui buku. Mohon isi nama buku",
            })
            .code(400);
        }

        if (readPage > pageCount) {
          return h
            .response({
              status: "fail",
              message:
                "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
            })
            .code(400);
        }

        const index = books.findIndex((book) => book.id === bookId);

        if (index === -1) {
          return h
            .response({
              status: "fail",
              message: "Gagal memperbarui buku. Id tidak ditemukan",
            })
            .code(404);
        }

        books[index] = {
          ...books[index],
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          reading,
          finished: pageCount === readPage,
          updatedAt,
        };

        return h
          .response({
            status: "success",
            message: "Buku berhasil diperbarui",
          })
          .code(200);
      },
    },
    {
      method: "DELETE",
      path: "/books/{bookId}",
      handler: (request, h) => {
        const { bookId } = request.params;
        const index = books.findIndex((book) => book.id === bookId);

        if (index === -1) {
          return h
            .response({
              status: "fail",
              message: "Buku gagal dihapus. Id tidak ditemukan",
            })
            .code(404);
        }

        books.splice(index, 1);
        return h
          .response({
            status: "success",
            message: "Buku berhasil dihapus",
          })
          .code(200);
      },
    },
  ]);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
