let img1;
let personagem;
let frutaVermelha, frutaVerde, frutaAmarela;
let somFruta, somErrado;

let x = 100, y = 100;
let velocidade = 3;

let frutas = [];
let corAtual = "vermelha";

let pontos = 0;
let vidas = 3;
let fase = 1;
let botaoProximo;
let botaoVoltar;
let botaoIniciar;
let botaoReiniciar;

let frutasCorretas = 0;
let frutasErradas = 0;

let tempoRestante = 30;
let ultimoTempo = 0;

let nomeJogador = "Jogador";

let pagina = 1; // 1=menu, 2=jogo, 3=fim

let teclas = { esquerda: false, direita: false, cima: false, baixo: false };

let coracao = null;
let tempoUltimoCoracao = 0;
let duracaoCoracao = 5000;

let podeAvancar = false;


function preload() {
  personagem = loadImage('personagem.png');
  frutaVermelha = loadImage('maça.png');
  frutaVerde = loadImage('frutaverde.png');
  frutaAmarela = loadImage('frutaamarela.png');
  img1 = loadImage ('capa.png');
  
  somFruta = loadSound('fruta.mp3');
  somErrado = loadSound('somerro.mp3');
}

  function setup() {
  createCanvas(400, 300);
   botaoProximo = createButton('➡️');
  botaoProximo.position(355, 250);
  botaoProximo.mousePressed(irProximo);
  botaoProximo.attribute('disabled', '');

  botaoVoltar = createButton('⬅️');
  botaoVoltar.position(10, 250);
  botaoVoltar.mousePressed(voltar);

  botaoIniciar = createButton('🎮 Iniciar');
  botaoIniciar.position(160, 250);
  botaoIniciar.mousePressed(liberarProximo);

  botaoReiniciar = createButton('🔁 Jogar Novamente');
  botaoReiniciar.position(135, 250);
  botaoReiniciar.mousePressed(reiniciar);
  botaoReiniciar.hide();

}  

  function draw() {
  background("green");
  if (pagina === 1) {
  image(img1, 0, 0, 400, 300);
  if (!podeAvancar) {
    let alpha = map(sin(millis() / 500), -1, 1, 50, 255);
    fill(255, 255, 255, alpha);
    textSize(16);
    textAlign(CENTER);
    text("Clique em 'Iniciar' para continuar", width / 2, 220);
  }
  } else if (pagina === 2) {
    jogarFase();
  } else if (pagina === 3) {
    telaFim();
  }
}

function telaFim() {
  fill("yellow");
  textSize(24);
  text("Fim de Jogo!", width / 2, height / 3);
  textSize(16);
  text("Pontuação final: " + pontos, width / 2, height / 2);
  text("Pressione ENTER para jogar novamente", width / 2, height / 2 + 30);
}

function jogarFase() {
  background(200);
  fill(0);
  textSize(15);
  text("Fase " + fase + " - Colha frutas " + corAtual, width / 2, 20);
  text("Pontos: " + pontos, 50, 20);
  text("Vidas: " + vidas, width - 70, 20);
  textSize(12);
  text("Jogador: " + nomeJogador, width / 2, 40);
  text("Tempo restante: " + nf(tempoRestante, 2, 1) + "s", width / 2, 60);

  // Movimento do personagem contínuo e rápido
  if (teclas.esquerda) x -= velocidade;
  if (teclas.direita) x += velocidade;
  if (teclas.cima) y -= velocidade;
  if (teclas.baixo) y += velocidade;

 // Limitar personagem dentro da tela
  x = constrain(x, 0, width - 50);
  y = constrain(y, 70, height - 50);

  image(personagem, x, y, 50, 50);

  // Criar coração a cada 6 segundos
  if (!coracao && millis() - tempoUltimoCoracao > 6000) {
    coracao = {
      x: random(30, width - 60),
      y: random(70, height - 60),
      tempoCriado: millis()
    };
    tempoUltimoCoracao = millis();
  }

  // Desenhar e controlar o coração
  if (coracao) {
    if (millis() - coracao.tempoCriado > duracaoCoracao) {
      coracao = null;
    } else {
      fill('red');
      noStroke();
      // Desenha coração simples
      ellipse(coracao.x + 10, coracao.y + 10, 20, 20);
      ellipse(coracao.x + 20, coracao.y + 10, 20, 20);
      triangle(coracao.x + 5, coracao.y + 15, coracao.x + 25, coracao.y + 15, coracao.x + 15, coracao.y + 30);

      if (colidiu(x, y, 50, 50, coracao.x, coracao.y, 30, 30)) {
        vidas++;
        coracao = null;
      }
    }
  }
  // Atualiza e desenha frutas
  for (let i = frutas.length - 1; i >= 0; i--) {
    let f = frutas[i];

    f.x += f.vx;
    f.y += f.vy;

    if (f.x <= 0 || f.x >= width - 30) f.vx *= -1;
    if (f.y <= 70 || f.y >= height - 30) f.vy *= -1;

    let img = f.cor === "vermelha" ? frutaVermelha :
              f.cor === "verde" ? frutaVerde : frutaAmarela;

    image(img, f.x, f.y, 30, 30);

   if (colidiu(x, y, 50, 50, f.x, f.y, 30, 30)) {
      if (f.cor === corAtual) {
        pontos++;
        frutasCorretas++;
        somFruta.play();
        if (frutasCorretas >= 3) proximaFase();
      } else {
        vidas--;
        frutasErradas++;
        somErrado.play();
        if (vidas <= 0) {
          pagina = 3;
          return;
        }
      }
      frutas.splice(i, 1);
    }
  }
  if (frutas.length < 5) novaFruta();

  controlarTempo();
}

function novaFruta() {
  let cores = ["vermelha", "verde", "amarela"];
  let cor = random(cores);

  frutas.push({
    x: random(30, width - 60),
    y: random(70, height - 60),
    vx: random([-2, -1, 1, 2]),
    vy: random([-2, -1, 1, 2]),
    cor: cor
  });
}

function proximaFase() {
  fase++;
  frutasCorretas = 0;
  pontos += 5;
  tempoRestante += 15;
  if (fase === 2) corAtual = "verde";
  else if (fase === 3) corAtual = "amarela";
  else if (fase > 3) {
    fase = 1;
    corAtual = "vermelha";
  }
  frutas = [];
}

function controlarTempo() {
  if (millis() - ultimoTempo > 1000) {
    tempoRestante--;
    ultimoTempo = millis();
    if (tempoRestante <= 0) {
      vidas--;
      tempoRestante = 30;
      if (vidas <= 0) {
        pagina = 3;
      }
    }
  }
}

function keyPressed() {
  if (pagina === 1 && keyCode === ENTER) {
    pagina = 2;
    resetarJogo();
  } else if (pagina === 3 && keyCode === ENTER) {
    pagina = 1;
  }
  if (pagina === 2) {
    if (keyCode === LEFT_ARROW) teclas.esquerda = true;
    if (keyCode === RIGHT_ARROW) teclas.direita = true;
    if (keyCode === UP_ARROW) teclas.cima = true;
    if (keyCode === DOWN_ARROW) teclas.baixo = true;
  }
}
function irProximo() {
  if (podeAvancar && pagina < 3) {
    pagina++;
  }
}

function voltar() {
  if (pagina > 1) {
    pagina--;
  }
}
function liberarProximo() {
  podeAvancar = true;
  botaoProximo.removeAttribute('disabled');
  botaoIniciar.hide();
}
function keyReleased() {
  if (pagina === 2) {
    if (keyCode === LEFT_ARROW) teclas.esquerda = false;
    if (keyCode === RIGHT_ARROW) teclas.direita = false;
    if (keyCode === UP_ARROW) teclas.cima = false;
    if (keyCode === DOWN_ARROW) teclas.baixo = false;
  }
}
function irProximo() {
  if (podeAvancar && pagina < 3) {
    pagina++;
  }
}

function resetarJogo() {
  x = 100; y = 100;
  pontos = 0;
  vidas = 3;
  fase = 1;
  corAtual = "vermelha";
  frutas = [];
  frutasCorretas = 0;
  frutasErradas = 0;
  tempoRestante = 30;
  ultimoTempo = millis();
  coracao = null;
  tempoUltimoCoracao = millis();
}
function reiniciar() {
  pagina = 1;
  fase = 1;
  pontos = 0;
  vidas = 3;
  podeAvancar = false;
  botaoReiniciar.hide();
  botaoIniciar.show();
  botaoProximo.attribute('disabled', '');
  x = 200;
  y = 150;
  novaFruta();
}

// Função simples para colisão de retângulos
function colidiu(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 < x2 || x1 > x2 + w2 || y1 + h1 < y2 || y1 > y2 + h2);
}





