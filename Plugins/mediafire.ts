import axios from "axios";
import cheerio from "cheerio";
interface MediaFire {
    filename: string;
    fileSize: string;
    link: string;
    uploadedAt: string;
}
export default function mediafire(url: string): Promise<MediaFire> {
    return new Promise((resolve, reject) => {
        if (!url.includes("mediafire.com")) reject("This is not MediaFire url!");
        axios
            .get(url)
            .then(({ data }) => {
                const $ = cheerio.load(data);
                const results = {
                    filename: $("body > main > div.content > div.center > div > div.dl-info > div.sidebar > div.apps > div > div").html()!,
                    fileSize: $("body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(1) > span").html()!,
                    link: $("#downloadButton").attr("href")!,
                    uploadedAt: $("body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span").html()!,
                };
                resolve(results);
            })
            .catch((e) => reject(e));
    });
}

// mediafire("https://www.mediafire.com/download/b8qbn882h502pxa");
