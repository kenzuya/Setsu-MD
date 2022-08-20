import axios from "axios";

interface SpotDLMetadata {
    name: string;
    artists: string[];
    artist: string;
    album_name: string;
    album_artist: string;
    genres: string[];
    disc_number: number;
    disc_count: number;
    duration: number;
    year: number;
    date: string;
    track_number: number;
    tracks_count: string;
    song_id: string;
    cover_url: string;
    explicit: boolean;
    publisher: string;
    url: string;
    isrc: string;
    copyright_text: string;
    download_url: string | null;
    song_list: null;
    lyrics: null;
}
async function spotdlInfo(url: string): Promise<SpotDLMetadata> {
    return new Promise((resolve, reject) => {
        axios
            .post(`https://spotify-api-express.herokuapp.com/info?url=${url}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch(reject);
    });
}
async function spotdlDownload(url: string): Promise<SpotDLMetadata> {
    return new Promise((resolve, reject) => {
        axios
            .post(`https://spotify-api-express.herokuapp.com/download?url=${url}`)
            .then((res) => {
                resolve(res.data);
            })
            .catch(reject);
    });
}

export { spotdlInfo, spotdlDownload };
