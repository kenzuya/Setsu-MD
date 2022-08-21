import axios from "axios";
import * as cheerio from "cheerio";
import FormData from "form-data";
export function ttsave(url: string) {
    return new Promise((resolve, reject) => {
        axios
            .request({
                url: "https://ttsave.app/id/",
                headers: {
                    cookie: "_ga=GA1.1.361674547.1650323398; _ga_1CPHGEZ2VQ=GS1.1.1650362820.3.1.1650362821.0",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                },
            })
            .then((results) => {
                const $ = cheerio.load(results.data);
                const element = $("body > script:nth-child(3)").html();
                const searchToken = element?.search("initToken");
                const token = element?.substring(searchToken! + 13).split(`'`)[0];
                const formdata = new FormData();
                formdata.append("id", url);
                formdata.append("token", token);
                formdata.append("mode", "video");
                axios({
                    method: "POST",
                    url: "https://ttsave.app/id/download.php",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
                        ...formdata.getHeaders(),
                    },
                    data: formdata,
                }).then(({ data }) => {
                    const $ = cheerio.load(data);
                    const result = {
                        views: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > div.flex.flex-row.items-center.justify-center.gap-2.mt-2 > div:nth-child(1) > span").html(),
                        likes: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > div.flex.flex-row.items-center.justify-center.gap-2.mt-2 > div:nth-child(2) > span").html(),
                        comments: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > div.flex.flex-row.items-center.justify-center.gap-2.mt-2 > div:nth-child(3) > span").html(),
                        share: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > div.flex.flex-row.items-center.justify-center.gap-2.mt-2 > div:nth-child(4) > span").html(),
                        caption: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > p.text-gray-600.px-2.text-center.break-all.w-3\\/4").html(),
                        profile: {
                            username: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > a.font-extrabold.text-blue-400.text-xl.mb-2").html(),
                            name: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > div:nth-child(1) > h2").html(),
                            url: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > a.font-extrabold.text-blue-400.text-xl.mb-2").attr("href"),
                            img: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > a.flex.flex-col.justify-center.items-center > img").attr("src"),
                        },
                        sound: {
                            title: $("body > div.flex.flex-col.items-center.justify-center.mt-2.mb-5 > div.flex.flex-row.items-center.justify-center.gap-1.mt-5.w-3\\/4 > span").html(),
                            url: $("#button-download-ready > a:nth-child(3)").attr("href"),
                        },
                        link: {
                            nowm: $("#button-download-ready > a:nth-child(1)").attr("href"),
                            wm: $("#button-download-ready > a:nth-child(2)").attr("href"),
                            thumbnail: $("#button-download-ready > a:nth-child(5)").attr("href"),
                        },
                    };
                    resolve(result);
                });
            })
            .catch((error) => reject(error));
    });
}
