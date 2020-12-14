const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Other Library
const brainly = require("brainly-scraper-v2");
const lyrics_search = require('@penfoldium/lyrics-search');
const lyrics = new lyrics_search(process.env.GENIUS_ACCESS_TOKEN);
const animeJs = require('@freezegold/anime.js');
const anime = new animeJs.Client();
const genshin = require('genshin-impact-api');

// Functions
function validateYouTubeUrl(url) {
    if (url != undefined || url != '') {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length == 11) {
            return true;
        } else {
            return false;
        }
    }
}

function getYoutubeId(url){
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

app.use(express.static(__dirname + '/public'));

app.get('/ytmp4', (req, res) => {
    let url = req.query.url;
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    ytdl(url, {
        format: 'mp4'
    }).pipe(res);
});

io.on('connection', socket => {
    socket.on('brainly', async (keyword) => {
        let result = await brainly(keyword)
        let pertanyaan = result.data[0].pertanyaan;
        let jawaban = result.data[0].jawaban[0].text;
        socket.emit('result', `<h5>Pertanyaan</h5><p>${pertanyaan}</p><h5>Jawaban</h5><p>${jawaban}</p>`);
    });
    socket.on('lirik', async (keyword) => {
        let error;
        let result = await Lyrics.search(keyword).catch(e => {
            error = e;
        });
        if(!error){
            socket.emit('result', `<h5>${result.primaryArtist.name} - ${result.title}</h5><p>${result.lyrics}</p>`);
        }else{
            socket.emit('result', `Gagal mendapatkan lirik: ${error}`);
        }
    });
    socket.on('anime', async (keyword) => {
        let result = await anime.searchAnime(keyword);
        socket.emit('result', `<div class="card" style="width: 18rem;">
        <img src="${results[0].posterImage.original}">
        <div class="card-body">
            <h5>Nama Anime</h5>
            <p>${results[0].titles.english}</p>
            <h5>Synopsis</h5>
            <p>${results[0].synopsis}</p>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${getYoutubeId(results[0].youtubeVideoId)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    </div>`);
    });
    socket.on('genshin', async (keyword) => {
        try{
            let result = genshin.characters(keyword.toLowerCase());
            socket.emit('result', `<div class="card" style="width: 18rem;">
            <img src="${result.image}">
            <div class="card-body">
                <h5>Nama</h5>
                <p>${result.name}</p>
                <h5>Deskripsi</h5>
                <p>${result.description}</p>
                <h5>Judul</h5>
                <p>${result.title}</p>
                <h5>Penglihatan</h5>
                <p>${result.vision}</p>
                <h5>Senjata</h5>
                <p>${result.weapon}</p>
                <h5>Jenis Kelamin</h5>
                <p>${result.gender}</p>
                <h5>Bangsa</h5>
                <p>${result.nation}</p>
                <h5>Kelangkaan</h5>
                <p>${result.rarity}</p>
                <h5>Info Lebih Lanjut</h5>
                <p>${result.url}</p>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${getYoutubeId(results[0].youtubeVideoId)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>`);
        }catch(e){
            socket.emit('result', 'Karakter tidak ditemukan')
        }
    });
    socket.on('ytmp4', async (keyword) => {
        if(validateYouTubeUrl(keyword)){
            socket.emit('result', `<a href="https://whatsappbot.racyete.repl.co/ytmp4?url=${args[0]}" class="btn btn-primary">Download Video</a>`);
        }else{
            socket.emit('result', 'Masukan URL Youtube yang benar');
        }
    });
  });

http.listen(8080, () => {
  console.log('Server Running');
});