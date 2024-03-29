import fs from "fs";
import readline from "readline";

const inputFileName = process.argv[2];

const extension = inputFileName.slice(-4);
let delimiter;

//Determines the type of file being used -> parser
if (extension === ".csv") {
  delimiter = ",";
} else if (extension === ".tsv") {
  delimiter = "\t";
} else {
  throw new Error("Incorrect file type");
}

const readStream = fs.createReadStream(inputFileName, "utf-8");
const writeStream = fs.createWriteStream("./output.csv", "utf-8");

const rl = readline.createInterface({
  input: readStream,
});

let numberReference: string[] = [];

//Reads through every line, and computes the values accordingly (better for performance (memory))
//Rather than loading the whole csv / tsv into memory
rl.on("line", (line) => {
  try {
    if (numberReference.length === 0) {
      numberReference = line
        .split(delimiter)
        .map((item) => sanatiseItem(item, /^[0-9]*$/));
      writeStream.write(line + "\n");
    } else {
      const newLine: string[] = [];
      line.split(delimiter).forEach((item) => {
        try {
          newLine.push(evaluateExpression(item));
        } catch (error) {
          throw new Error("Error evaluating expression");
        }
      });
      writeStream.write(newLine.join(",") + "\n");
    }
  } catch (error) {
    console.error(error);
  }
});

rl.on("error", (error) => {
  console.error("Error reading file", error);
});

rl.on("close", () => {
  writeStream.end();
  console.log("Output.csv created successfully");
});

const evaluateExpression = (expression: string): string => {
  const regex = /[A-K]/g;
  const matched = expression.match(regex);

  if (!matched) {
    throw new Error("Invalid expression");
  }

  matched?.forEach((character) => {
    expression = expression.replace(
      character,
      numberReference[character.charCodeAt(0) - 65]
    );
  });

  return eval(expression);
};

const sanatiseItem = (item: string, regex: RegExp): string => {
  item = item.trim();
  if (!regex.test(item)) {
    throw new Error("Invalid input");
  }
  return item;
};
