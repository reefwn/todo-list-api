import * as fs from "fs";

export const db = "db.json";
const encode = "utf8";

export const write = (data: any) => {
  const json = JSON.stringify(data);
  fs.writeFileSync(db, json);
};

export const read = () => {
  const json = fs.readFileSync(db, encode);
  return JSON.parse(json);
};
