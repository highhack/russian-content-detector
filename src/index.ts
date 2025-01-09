// src/index.ts
import axios from "axios";
import type { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { franc } from "franc";
import langs from "langs";
import { isRussianWord } from "./russianDetector.js";
import iconv from "iconv-lite";
import { Languages, TextElement, WebsiteAnalysis } from "./types.js";

async function analyzeWebsite(
  url: string,
  config?: {
    resultArrayType?: "onlyText";
  }
): Promise<WebsiteAnalysis> {
  try {
    const response: AxiosResponse = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Detect charset
    let charset = "utf-8";
    const contentType = response.headers["content-type"];
    if (contentType) {
      const matches = contentType.match(/charset=([^;]+)/i);
      if (matches) {
        charset = matches[1];
      }
    }

    const html = iconv.decode(response.data, charset);
    const $ = cheerio.load(html, { decodeEntities: false });

    // Remove unwanted elements
    $("script").remove();
    $("style").remove();
    $("noscript").remove();
    $("iframe").remove();

    // Extract text from specific tags
    const textElements: TextElement[] = [];
    const relevantTags = [
      "div",
      "p",
      "span",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "li",
      "a",
    ];

    relevantTags.forEach((tag) => {
      $(tag).each((_, element) => {
        const text = $(element).text().trim();
        if (text) {
          // Only include elements that have text
          const containsRussian = text
            .split(" ")
            .some((word) => isRussianWord(word));

          textElements.push({
            tag,
            text,
            containsRussian,
          });
        }
      });
    });

    // Get overall language of the page
    const allText = textElements.map((el) => el.text).join(" ");
    const languageCode: string = franc(allText, { minLength: 3 });
    const language = langs.where("3", languageCode);
    const isRussian: boolean = languageCode === "rus";

    return {
      url,
      isRussianLanguage: isRussian,
      detectedLanguage: language ? language.name : "Unknown",
      textElements:
        config?.resultArrayType === "onlyText"
          ? textElements.map((el, index) => {
              return {
                [index + 1]: el.text,
              };
            })
          : textElements,
      russianElementsCount: textElements.filter((el) => el.containsRussian)
        .length,
      languageConfidence:
        languageCode === "und" ? "Unable to determine" : "High",
      detectedCharset: charset,
    };
  } catch (error) {
    console.error(
      `Error analyzing ${url}:`,
      error instanceof Error ? error.message : String(error)
    );
    return {
      url,
      isRussianLanguage: false,
      detectedLanguage: "Unknown",
      textElements: [],
      russianElementsCount: 0,
      languageConfidence: "None",
      detectedCharset: "unknown",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Example usage
const url: string = "https://support.wix.com/ru";
console.log("Analyzing website...");
analyzeWebsite(url)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error("Error:", error);
  });
