import { randomUUID } from "crypto";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import { promises as fs } from "fs";
import { TodoItem } from "./interface";
import { db, read, write } from "./utils";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (_: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

/** [CREATE] */
app.post("/todo", (req: Request, res: Response) => {
  // validate body
  const { body } = req;
  if (!body?.task)
    return res.status(400).send({ success: false, msg: "TaskIsRequired" });

  // find duplicate
  const dbTodo: TodoItem[] = read();
  const findExist = dbTodo.find((item) => item.task === body.task);
  if (findExist)
    return res.status(409).send({ success: false, msg: "DuplicateItem" });

  const todoItem: TodoItem = {
    id: randomUUID(),
    task: body.task,
    is_done: false,
  };
  if (body.is_done) todoItem.is_done = body.is_done;

  // save to file
  dbTodo.push(todoItem);
  write(dbTodo);

  res.send({ success: true, msg: "TodoIsAdded" });
});

/** [READ] */
app.get("/todo", (_: Request, res: Response) => {
  const dbTodo: TodoItem[] = read();
  res.send({ success: true, msg: "Success", data: dbTodo });
});

/** [READ] */
app.get("/todo/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const dbTodo: TodoItem[] = read();

  // find item
  const itemIndex = dbTodo.findIndex((item) => item.id === id);
  if (itemIndex < 0)
    res.status(404).send({ success: false, msg: "NotFoundItem" });
  const findItem = dbTodo[itemIndex];

  res.send({ success: true, msg: "Success", data: findItem });
});

/** [UPDATE] */
app.patch("/todo/:id", (req: Request, res: Response) => {
  const { params, body } = req;

  // validate param
  const { id } = params;
  if (!id) return res.status(400).send({ success: false, msg: "IdIsRequired" });

  // validate body
  if (!body.task && !body.is_done)
    return res.status(400).send({ success: false, msg: "BodyIsRequired" });

  const dbTodo: TodoItem[] = read();

  // find item
  const itemIndex = dbTodo.findIndex((item) => item.id === id);
  if (itemIndex < 0)
    res.status(404).send({ success: false, msg: "NotFoundItem" });
  const findItem = dbTodo[itemIndex];

  // find duplicate
  const findExist = dbTodo.find((item) => item.task === body.task);
  if (findExist)
    return res.status(409).send({ success: false, msg: "DuplicateItem" });

  // update value
  if (body.task) findItem.task = body.task;
  if (body.is_done) findItem.is_done = body.is_done;

  // save to file
  dbTodo[itemIndex] = findItem;
  write(dbTodo);

  res.send({ success: true, msg: "TodoIsUpdated" });
});

/** [DELETE] */
app.delete("/todo/:id", (req: Request, res: Response) => {
  const { params, body } = req;

  // validate param
  const { id } = params;
  if (!id) return res.status(400).send({ success: false, msg: "IdIsRequired" });

  const dbTodo: TodoItem[] = read();

  const filterTodo = dbTodo.filter((item) => item.id !== id);
  if (dbTodo.length === filterTodo.length) {
    return res.status(409).send({ success: false, msg: "NotFoundItem" });
  }

  // save to file
  write(filterTodo);
  res.send({ success: true, msg: "TodoIsDeleted" });
});

app.listen(port, () => {
  // init db file
  fs.readFile(db).catch(() => fs.writeFile(db, "[]"));
  console.log(`⚡️ [server]: server is running at http://localhost:${port}`);
});
