game.module(
    'game.main_assets'
)
.require(
    'engine.audio'
)
.body(function() {

game.addAsset('doctor.png');
game.addAsset('background.png');
game.addAsset('panda.png');
game.addAsset('circle.png');
game.addAsset('circle-blue2.png');
game.addAsset('circle-green2.png');
game.addAsset('best.png');
game.addAsset('icons/heart.png');

game.addAsset('font.fnt');

game.addAudio('sound/woosh.wav', 'catch');
game.addAudio('sound/click.wav', 'click');
game.addAudio('sound/ting.wav', 'ting');
game.addAudio('sound/music.wav', 'music');
game.addAudio('sound/musicVictory.wav', 'musicVictory');

game.addAudio('sound/firework/boom1.wav', 'boom1');
game.addAudio('sound/firework/boom2.wav', 'boom2');
game.addAudio('sound/firework/boom3.wav', 'boom3');
game.addAudio('sound/firework/boom4.wav', 'boom4');

game.addAudio('sound/popwood1.wav', 'popwood1');
game.addAudio('sound/popwood2.wav', 'popwood2');
game.addAudio('sound/soin.mp3', 'cure');
game.addAudio('sound/reload.mp3', 'reload');

game.addAudio('sound/firework/pop1.wav', 'pop1');
game.addAudio('sound/firework/pop2.wav', 'pop2');
game.addAudio('sound/firework/pop3.wav', 'pop3');
game.addAudio('sound/firework/pop4.wav', 'pop4');
game.addAudio('sound/firework/pop5.wav', 'pop5');
game.addAudio('sound/firework/pop6.wav', 'pop6');

});