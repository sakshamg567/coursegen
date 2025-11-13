import { wrapAISDK } from "langsmith/experimental/vercel";
import * as ai from "ai";

const { generateObject, generateText } = wrapAISDK(ai);

export { generateObject, generateText };
