module.exports = function (app) {
  app.get('/', function (req, res) {
    //res.sendFile(__dirname + '/views/index.html');
    res.render('index');
  });

  app.get('/game', function (req, res) {
    //res.sendFile(__dirname + '/views/game.html');
    res.render('game');
  });
};