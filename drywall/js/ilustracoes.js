/* ============================================================
   DrywallPC - ilustrações dos produtos da loja
   Projeto semestral da turma CDC2NA, UniFECAF, Expotech 2026

   Cada produto da loja tem um desenho feito aqui em SVG, sem
   arquivos de imagem e sem internet. Uso (ver js/loja.js):
     Ilustracoes.desenhar('balde', '#FFC20E')  -> texto do <svg>
   Tipos: placa, perfil, cantoneira, parafuso, bucha, balde,
   fita, rolo-la, saco, bloco, parafusadeira, trena, espatula,
   estilete, serrote, nivel, alicate, rolo-pintura, martelo,
   lixa, capacete, oculos, luva, mascara, kit, forro, arame,
   regulador.
   ============================================================ */

(function () {
  'use strict';

  var TRACO = '#23252A';
  var ACO = '#C3C7CC';
  var FUNDO = '#ECEBE7';

  /* Clareia (f > 0) ou escurece (f < 0) uma cor #RRGGBB. */
  function tom(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var c = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
      v = f < 0 ? v * (1 + f) : v + (255 - v) * f;
      return ('0' + Math.round(v).toString(16)).slice(-2);
    });
    return '#' + c.join('');
  }

  function pts(lista) { return lista.map(function (p) { return p[0] + ',' + p[1]; }).join(' '); }
  function pol(lista, cor) { return '<polygon points="' + pts(lista) + '" fill="' + cor + '"/>'; }
  function desloca(lista, dx, dy) { return lista.map(function (p) { return [p[0] + dx, p[1] + dy]; }); }

  var D = {};

  /* Pilha de placas vista de cima, em perspectiva. */
  D.placa = function (c) {
    var topo = [[40, 74], [190, 36], [285, 76], [135, 114]];
    var s = '';
    for (var i = 2; i >= 0; i--) {
      var t = desloca(topo, 0, i * 16);
      s += pol([t[0], t[3], [t[3][0], t[3][1] + 10], [t[0][0], t[0][1] + 10]], tom(c, -0.35));
      s += pol([t[3], t[2], [t[2][0], t[2][1] + 10], [t[3][0], t[3][1] + 10]], tom(c, -0.2));
      s += pol(t, c);
    }
    s += '<line x1="70" y1="80" x2="190" y2="50" stroke-width="2" opacity=".35"/>';
    return s;
  };

  /* Barras de perfil em U (montante, guia, F530, tabica). */
  D.perfil = function (c) {
    var s = '';
    [-26, 8, 42].forEach(function (o) {
      s += pol([[30, 100 + o], [40, 116 + o], [40, 126 + o], [30, 110 + o]], tom(c, -0.4));
      s += pol([[30, 100 + o], [280, 42 + o], [290, 58 + o], [40, 116 + o]], c);
      s += pol([[42, 104 + o], [278, 49 + o], [283, 56 + o], [46, 111 + o]], tom(c, -0.3));
    });
    return s;
  };

  /* Cantoneira perfurada: barra em L com furos. */
  D.cantoneira = function (c) {
    var s = '';
    [-8, 36].forEach(function (o) {
      s += pol([[30, 100 + o], [285, 40 + o], [292, 52 + o], [37, 112 + o]], c);
      s += pol([[37, 112 + o], [292, 52 + o], [285, 64 + o], [30, 124 + o]], tom(c, -0.25));
      for (var x = 50; x < 280; x += 22) {
        var y = 100 + o - (x - 30) * 60 / 255;
        s += '<circle cx="' + (x + 3) + '" cy="' + (y + 6) + '" r="3" fill="' + TRACO + '" stroke="none"/>';
        s += '<circle cx="' + x + '" cy="' + (y + 17) + '" r="2.5" fill="' + TRACO + '" stroke="none"/>';
      }
    });
    return s;
  };

  /* Parafusos deitados (também serve para pinos). */
  D.parafuso = function (c) {
    var s = '';
    [[70, 58, 170], [55, 100, 195], [85, 142, 140]].forEach(function (p) {
      var x = p[0], y = p[1], L = p[2];
      s += pol([[x + 6, y - 6], [x + L, y - 6], [x + L + 18, y], [x + L, y + 6], [x + 6, y + 6]], c);
      for (var xi = x + 18; xi < x + L; xi += 11) {
        s += '<line x1="' + xi + '" y1="' + (y - 6) + '" x2="' + (xi + 6) + '" y2="' + (y + 6) + '" stroke="' + tom(c, 0.45) + '" stroke-width="2"/>';
      }
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="8" ry="16" fill="' + tom(c, 0.15) + '"/>';
      s += '<line x1="' + x + '" y1="' + (y - 8) + '" x2="' + x + '" y2="' + (y + 8) + '" stroke-width="2"/>';
    });
    return s;
  };

  /* Buchas de nylon com aletas. */
  D.bucha = function (c) {
    var s = '';
    [[80, 50], [60, 95], [100, 138]].forEach(function (p) {
      var x = p[0], y = p[1];
      s += '<rect x="' + x + '" y="' + (y - 11) + '" width="130" height="22" rx="6" fill="' + c + '"/>';
      for (var xi = x + 20; xi < x + 120; xi += 18) {
        s += pol([[xi, y - 11], [xi + 10, y - 18], [xi + 12, y - 11]], c);
        s += pol([[xi, y + 11], [xi + 10, y + 18], [xi + 12, y + 11]], c);
      }
      s += '<rect x="' + (x - 10) + '" y="' + (y - 17) + '" width="12" height="34" rx="3" fill="' + tom(c, -0.15) + '"/>';
      s += '<line x1="' + (x + 6) + '" y1="' + y + '" x2="' + (x + 124) + '" y2="' + y + '" stroke-width="2" opacity=".4"/>';
    });
    return s;
  };

  /* Balde com faixa de rótulo (massa, selador, tinta). */
  D.balde = function (c) {
    var s = '';
    s += '<path d="M108 62 Q160 2 212 62" fill="none" stroke-width="4"/>';
    s += pol([[108, 62], [212, 62], [200, 160], [120, 160]], '#F4F3EF');
    s += pol([[111, 86], [209, 86], [205, 126], [115, 126]], c);
    s += '<line x1="128" y1="106" x2="192" y2="106" stroke="' + (tom(c, -0.5)) + '" stroke-width="5"/>';
    s += '<ellipse cx="160" cy="62" rx="52" ry="12" fill="' + tom('#F4F3EF', -0.08) + '"/>';
    s += '<ellipse cx="160" cy="160" rx="40" ry="6" fill="#F4F3EF"/>';
    return s;
  };

  /* Rolo de fita (papel ou telada). */
  D.fita = function (c) {
    var s = '';
    s += pol([[160, 140], [290, 128], [290, 146], [160, 158]], tom(c, -0.1));
    s += '<circle cx="140" cy="92" r="64" fill="' + c + '"/>';
    s += '<circle cx="140" cy="92" r="48" fill="none" stroke-width="1.5" opacity=".4"/>';
    s += '<circle cx="140" cy="92" r="26" fill="' + tom(c, -0.3) + '"/>';
    s += '<circle cx="140" cy="92" r="18" fill="' + FUNDO + '"/>';
    return s;
  };

  /* Rolo de lã (vidro ou rocha), deitado. */
  D['rolo-la'] = function (c) {
    var s = '';
    s += '<rect x="60" y="50" width="180" height="104" fill="' + c + '"/>';
    for (var x = 78; x < 240; x += 18) {
      s += '<path d="M' + x + ' 54 q6 10 0 20 q-6 10 0 20 q6 10 0 20 q-6 10 0 20 q6 10 0 16" fill="none" stroke-width="1.5" opacity=".35"/>';
    }
    s += '<ellipse cx="240" cy="102" rx="26" ry="52" fill="' + tom(c, -0.12) + '"/>';
    s += '<path d="M240 102 m-6 0 a6 12 0 1 0 12 0 a12 24 0 1 0 -24 0 a18 36 0 1 0 36 0" fill="none" stroke-width="2"/>';
    s += '<ellipse cx="60" cy="102" rx="26" ry="52" fill="none" stroke="none"/>';
    s += '<path d="M60 50 A26 52 0 0 0 60 154" fill="' + c + '"/>';
    return s;
  };

  /* Saco (cimento, argamassa, areia, cal). */
  D.saco = function (c) {
    var s = '';
    s += '<path d="M100 48 L220 48 Q234 100 224 160 L96 160 Q86 100 100 48 Z" fill="#E9E4D8"/>';
    s += '<path d="M100 48 L110 36 L120 48 L130 36 L140 48 L150 36 L160 48 L170 36 L180 48 L190 36 L200 48 L210 36 L220 48" fill="#E9E4D8"/>';
    s += '<rect x="99" y="84" width="122" height="46" fill="' + c + '"/>';
    s += '<rect x="116" y="96" width="88" height="10" fill="' + FUNDO + '" stroke="none"/>';
    s += '<rect x="116" y="111" width="56" height="7" fill="' + FUNDO + '" stroke="none"/>';
    return s;
  };

  /* Bloco cerâmico com furos. */
  D.bloco = function (c) {
    var s = '';
    s += pol([[90, 72], [130, 44], [270, 44], [230, 72]], tom(c, 0.2));
    s += pol([[230, 72], [270, 44], [270, 124], [230, 152]], tom(c, -0.25));
    s += '<rect x="90" y="72" width="140" height="80" fill="' + c + '"/>';
    for (var r = 0; r < 2; r++) {
      for (var k = 0; k < 3; k++) {
        s += '<rect x="' + (102 + k * 42) + '" y="' + (84 + r * 34) + '" width="32" height="24" fill="' + tom(c, -0.45) + '"/>';
      }
    }
    return s;
  };

  /* Parafusadeira a bateria. */
  D.parafusadeira = function (c) {
    var s = '';
    s += '<line x1="262" y1="72" x2="296" y2="72" stroke-width="5"/>';
    s += '<rect x="228" y="58" width="36" height="28" rx="4" fill="' + TRACO + '"/>';
    s += pol([[132, 92], [172, 92], [160, 146], [124, 146]], c);
    s += '<rect x="100" y="144" width="86" height="24" rx="4" fill="' + TRACO + '"/>';
    s += '<rect x="80" y="44" width="152" height="54" rx="20" fill="' + c + '"/>';
    s += '<rect x="96" y="56" width="44" height="12" rx="6" fill="' + TRACO + '" stroke="none"/>';
    s += '<rect x="170" y="98" width="12" height="20" rx="3" fill="' + TRACO + '"/>';
    return s;
  };

  /* Trena. */
  D.trena = function (c) {
    var s = '';
    s += '<rect x="176" y="120" width="116" height="16" fill="#FFE58A"/>';
    for (var x = 186; x < 290; x += 10) {
      s += '<line x1="' + x + '" y1="120" x2="' + x + '" y2="' + (x % 20 === 6 ? 130 : 126) + '" stroke-width="1.5"/>';
    }
    s += '<rect x="288" y="114" width="8" height="26" fill="' + ACO + '"/>';
    s += '<rect x="70" y="44" width="122" height="112" rx="26" fill="' + c + '"/>';
    s += '<circle cx="131" cy="100" r="30" fill="' + tom(c, -0.3) + '"/>';
    s += '<circle cx="131" cy="100" r="8" fill="' + ACO + '"/>';
    s += '<rect x="150" y="38" width="28" height="12" rx="3" fill="' + TRACO + '"/>';
    return s;
  };

  /* Espátula. */
  D.espatula = function (c) {
    var s = '';
    s += pol([[70, 30], [250, 30], [222, 96], [98, 96]], ACO);
    s += '<line x1="90" y1="40" x2="230" y2="40" stroke="#fff" stroke-width="3" opacity=".7"/>';
    s += '<rect x="140" y="96" width="40" height="16" fill="' + tom(ACO, -0.2) + '"/>';
    s += '<rect x="146" y="112" width="28" height="56" rx="10" fill="' + c + '"/>';
    return s;
  };

  /* Estilete. */
  D.estilete = function (c) {
    var s = '';
    s += pol([[236, 64], [296, 46], [246, 84]], ACO);
    s += pol([[40, 120], [236, 60], [246, 86], [50, 146]], c);
    s += pol([[120, 106], [160, 94], [164, 104], [124, 116]], TRACO);
    return s;
  };

  /* Serrote para gesso. */
  D.serrote = function (c) {
    var s = '';
    // Lâmina: borda de cima reta, borda de baixo com dentes.
    var lamina = [[30, 70], [210, 62]];
    lamina.push([210, 100]);
    for (var x = 210; x > 30; x -= 10) { lamina.push([x - 5, 110]); lamina.push([x - 10, 100]); }
    s += pol(lamina, ACO);
    s += '<line x1="50" y1="78" x2="200" y2="72" stroke="#fff" stroke-width="3" opacity=".7"/>';
    s += '<path d="M206 50 L290 50 Q300 50 300 62 L300 120 Q300 132 288 132 L236 132 Q206 132 206 104 Z" fill="' + c + '"/>';
    s += '<rect x="230" y="70" width="46" height="40" rx="12" fill="' + FUNDO + '"/>';
    return s;
  };

  /* Nível de bolha. */
  D.nivel = function (c) {
    var s = '';
    s += '<rect x="26" y="74" width="268" height="40" fill="' + c + '"/>';
    s += '<rect x="26" y="74" width="22" height="40" fill="' + TRACO + '"/>';
    s += '<rect x="272" y="74" width="22" height="40" fill="' + TRACO + '"/>';
    s += '<rect x="140" y="80" width="40" height="28" rx="4" fill="#C8E6A8"/>';
    s += '<ellipse cx="160" cy="94" rx="9" ry="7" fill="#F4F3EF" stroke-width="2"/>';
    s += '<line x1="148" y1="82" x2="148" y2="106" stroke-width="2"/><line x1="172" y1="82" x2="172" y2="106" stroke-width="2"/>';
    s += '<rect x="76" y="86" width="40" height="16" rx="8" fill="' + FUNDO + '"/>';
    s += '<rect x="204" y="86" width="40" height="16" rx="8" fill="' + FUNDO + '"/>';
    return s;
  };

  /* Alicate (puncionador). */
  D.alicate = function (c) {
    var s = '';
    s += pol([[150, 86], [284, 128], [280, 146], [142, 100]], c);
    s += pol([[150, 86], [284, 70], [286, 88], [152, 102]], tom(c, -0.15));
    s += pol([[150, 86], [40, 54], [36, 66], [146, 96]], ACO);
    s += pol([[150, 96], [40, 104], [42, 116], [152, 104]], ACO);
    s += '<circle cx="150" cy="94" r="12" fill="' + tom(ACO, -0.2) + '"/>';
    return s;
  };

  /* Rolo de pintura. */
  D['rolo-pintura'] = function (c) {
    var s = '';
    s += '<path d="M220 66 L250 66 L250 108 L180 108 L180 124" fill="none" stroke-width="5"/>';
    s += '<rect x="166" y="122" width="28" height="48" rx="8" fill="' + c + '"/>';
    s += '<rect x="56" y="38" width="170" height="56" rx="14" fill="#F4F3EF"/>';
    for (var x = 70; x < 220; x += 12) s += '<line x1="' + x + '" y1="44" x2="' + (x + 6) + '" y2="88" stroke-width="1.5" opacity=".3"/>';
    return s;
  };

  /* Martelo. */
  D.martelo = function (c) {
    var s = '';
    s += pol([[150, 70], [170, 70], [190, 168], [166, 170]], c);
    s += '<path d="M90 44 L210 44 L210 74 L110 74 Q96 74 90 60 Z" fill="' + ACO + '"/>';
    s += '<path d="M210 48 Q250 46 262 80 Q240 64 210 70 Z" fill="' + ACO + '"/>';
    s += '<rect x="70" y="40" width="26" height="38" rx="4" fill="' + tom(ACO, -0.2) + '"/>';
    return s;
  };

  /* Lixas. */
  D.lixa = function (c) {
    var s = '';
    s += '<g transform="rotate(-8 160 100)"><rect x="80" y="44" width="170" height="110" fill="' + tom(c, -0.15) + '"/></g>';
    s += '<g transform="rotate(4 160 100)"><rect x="70" y="40" width="170" height="110" fill="' + c + '"/>';
    for (var i = 0; i < 70; i++) {
      var x = 80 + (i * 37) % 150, y = 50 + (i * 23) % 92;
      s += '<circle cx="' + x + '" cy="' + y + '" r="1.6" fill="' + tom(c, -0.45) + '" stroke="none"/>';
    }
    s += '</g>';
    return s;
  };

  /* Capacete. */
  D.capacete = function (c) {
    var s = '';
    s += '<ellipse cx="160" cy="132" rx="104" ry="16" fill="' + tom(c, -0.15) + '"/>';
    s += '<path d="M76 128 Q76 40 160 40 Q244 40 244 128 Z" fill="' + c + '"/>';
    s += '<path d="M146 42 L146 128 M174 42 L174 128" stroke-width="2" opacity=".5"/>';
    s += '<path d="M150 41 Q160 36 170 41 L170 128 L150 128 Z" fill="' + tom(c, -0.1) + '"/>';
    return s;
  };

  /* Óculos de proteção. */
  D.oculos = function (c) {
    var s = '';
    s += '<path d="M44 80 L20 70 M276 80 L300 70" stroke-width="6" fill="none"/>';
    s += '<path d="M44 66 Q44 56 56 56 L264 56 Q276 56 276 66 L276 110 Q276 132 252 132 L196 132 Q180 132 172 112 Q160 96 148 112 Q140 132 124 132 L68 132 Q44 132 44 110 Z" fill="' + c + '" fill-opacity=".55"/>';
    s += '<path d="M60 70 L120 70" stroke="#fff" stroke-width="4" opacity=".8"/>';
    s += '<path d="M200 70 L250 70" stroke="#fff" stroke-width="4" opacity=".8"/>';
    s += '<rect x="44" y="52" width="232" height="10" rx="5" fill="' + TRACO + '"/>';
    return s;
  };

  /* Luva. */
  D.luva = function (c) {
    var s = '';
    s += '<path d="M118 168 L118 120 Q86 104 78 80 Q74 66 86 66 Q96 66 104 84 L112 96 L112 46 Q112 34 124 34 Q136 34 136 46 L136 86 L138 34 Q138 22 150 22 Q162 22 162 34 L162 86 L166 40 Q166 28 178 28 Q190 28 190 40 L188 92 L194 56 Q196 44 208 46 Q218 48 216 60 L208 126 Q204 146 196 152 L196 168 Z" fill="' + c + '"/>';
    s += '<rect x="112" y="150" width="90" height="20" fill="' + tom(c, -0.3) + '"/>';
    return s;
  };

  /* Máscara PFF2. */
  D.mascara = function (c) {
    var s = '';
    s += '<path d="M60 70 Q20 90 60 120 M260 70 Q300 90 260 120" fill="none" stroke-width="3"/>';
    s += '<path d="M70 96 Q70 48 160 40 Q250 48 250 96 Q250 150 160 160 Q70 150 70 96 Z" fill="' + c + '"/>';
    s += '<path d="M160 40 L160 160" stroke-width="2" opacity=".4"/>';
    s += '<path d="M120 50 Q160 64 200 50" fill="none" stroke-width="3"/>';
    s += '<circle cx="200" cy="112" r="18" fill="' + tom(c, -0.4) + '"/>';
    s += '<circle cx="200" cy="112" r="8" fill="' + ACO + '"/>';
    return s;
  };

  /* Kit Gabinete: cubo de drywall verde com cantoneiras. */
  D.kit = function (c) {
    var s = '';
    s += pol([[160, 22], [246, 56], [160, 90], [74, 56]], tom(c, 0.15));
    s += pol([[74, 56], [160, 90], [160, 166], [74, 132]], tom(c, -0.15));
    s += pol([[160, 90], [246, 56], [246, 132], [160, 166]], c);
    s += pol([[178, 98], [232, 77], [232, 120], [178, 141]], '#BFDDF0');
    s += '<path d="M74 56 L74 132 M160 90 L160 166 M246 56 L246 132 M74 56 L160 22 L246 56" stroke="#FFC20E" stroke-width="5" fill="none"/>';
    return s;
  };

  /* Réguas de forro de PVC. */
  D.forro = function (c) {
    var s = '';
    for (var i = 0; i < 4; i++) {
      var o = i * 24;
      s += pol([[30, 96 + o], [250, 30 + o], [292, 44 + o], [72, 110 + o]], i % 2 ? tom(c, -0.05) : c);
      s += '<line x1="50" y1="' + (103 + o) + '" x2="270" y2="' + (37 + o) + '" stroke-width="1.5" opacity=".4"/>';
    }
    return s;
  };

  /* Rolo de arame. */
  D.arame = function (c) {
    var s = '';
    for (var i = 0; i < 9; i++) {
      s += '<ellipse cx="' + (130 + i * 7) + '" cy="96" rx="40" ry="60" fill="none" stroke="' + (i % 2 ? c : tom(c, -0.35)) + '" stroke-width="6"/>';
    }
    s += '<path d="M190 120 Q240 140 288 110" fill="none" stroke="' + c + '" stroke-width="5"/>';
    return s;
  };

  /* Regulador de forro com mola e haste. */
  D.regulador = function (c) {
    var s = '';
    s += '<line x1="160" y1="20" x2="160" y2="168" stroke="' + TRACO + '" stroke-width="7"/>';
    s += '<line x1="160" y1="20" x2="160" y2="168" stroke="' + c + '" stroke-width="3"/>';
    s += '<rect x="122" y="70" width="76" height="22" rx="4" fill="' + c + '"/>';
    s += '<path d="M148 96 h24 M148 104 h24 M148 112 h24 M148 120 h24" stroke-width="3"/>';
    s += '<path d="M126 130 L194 130 L194 150 L180 150 L180 140 L140 140 L140 150 L126 150 Z" fill="' + tom(c, -0.2) + '"/>';
    return s;
  };

  window.Ilustracoes = {
    desenhar: function (tipo, cor) {
      var f = D[tipo] || D.placa;
      return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">' +
        '<g stroke="' + TRACO + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
        f(cor || '#FFC20E') + '</g></svg>';
    }
  };
})();
