/* ============================================================
   DrywallPC - lista de produtos da loja
   Usada pela loja (js/loja.js) e pelo simulador (js/simulador.js).
   ============================================================ */

/* ---------- Produtos: edite aqui nomes, preços e estoque ---------- */
// codigo: etiqueta curta que aparece no canto da imagem
// img:    [desenho, cor] feito pelo js/ilustracoes.js (lista de desenhos lá no topo)
// foto:   (opcional) caminho de uma foto real, ex.: 'fotos/produtos/trena.jpg'.
//         Se existir, a foto aparece no lugar do desenho.
// destaque: (opcional) selo amarelo no canto da imagem
window.PRODUTOS = [
  // Placas
  { id: 'placa-st', nome: 'Placa drywall Standard 12,5 mm', cat: 'Placas', codigo: 'ST 12,5', img: ['placa', '#F4F3EF'], preco: 45.90, unidade: 'placa 1,20 × 1,80 m', estoque: 120, desc: 'Placa branca para paredes e forros em áreas secas.' },
  { id: 'placa-ru', nome: 'Placa drywall RU 12,5 mm', cat: 'Placas', codigo: 'RU 12,5', img: ['placa', '#7DB46C'], preco: 62.90, unidade: 'placa 1,20 × 1,80 m', estoque: 80, desc: 'Resistente à umidade, para banheiros e cozinhas. A placa do gabinete do DrywallPC.', destaque: 'Usada no DrywallPC' },
  { id: 'placa-rf', nome: 'Placa drywall RF 12,5 mm', cat: 'Placas', codigo: 'RF 12,5', img: ['placa', '#E9A3A8'], preco: 69.90, unidade: 'placa 1,20 × 1,80 m', estoque: 40, desc: 'Resistente ao fogo, para saídas de emergência e shafts.' },
  { id: 'placa-st-15', nome: 'Placa drywall Standard 15 mm', cat: 'Placas', codigo: 'ST 15', img: ['placa', '#E4E2DA'], preco: 58.90, unidade: 'placa 1,20 × 1,80 m', estoque: 50, desc: 'Mais grossa, para paredes com melhor isolamento e mais resistência.' },
  { id: 'placa-cimenticia', nome: 'Placa cimentícia 10 mm', cat: 'Placas', codigo: 'CIM 10', img: ['placa', '#A7A9A4'], preco: 129.90, unidade: 'placa 1,20 × 2,40 m', estoque: 25, desc: 'Para áreas externas, fachadas e áreas molhadas.' },

  // Perfis
  { id: 'montante-48', nome: 'Montante 48 mm', cat: 'Perfis', codigo: 'M 48', img: ['perfil', '#C3C7CC'], preco: 27.90, unidade: 'barra de 3 m', estoque: 200, desc: 'Perfil vertical de aço galvanizado que forma a estrutura da parede.' },
  { id: 'guia-48', nome: 'Guia 48 mm', cat: 'Perfis', codigo: 'G 48', img: ['perfil', '#B5BAC0'], preco: 23.90, unidade: 'barra de 3 m', estoque: 150, desc: 'Perfil fixado no piso e no teto, onde os montantes encaixam.' },
  { id: 'montante-70', nome: 'Montante 70 mm', cat: 'Perfis', codigo: 'M 70', img: ['perfil', '#D0D3D7'], preco: 32.90, unidade: 'barra de 3 m', estoque: 120, desc: 'Para paredes mais altas ou com mais espaço para instalações.' },
  { id: 'guia-70', nome: 'Guia 70 mm', cat: 'Perfis', codigo: 'G 70', img: ['perfil', '#C0C4C9'], preco: 28.90, unidade: 'barra de 3 m', estoque: 100, desc: 'Guia de piso e teto para o montante de 70 mm.' },
  { id: 'cantoneira', nome: 'Cantoneira metálica perfurada', cat: 'Perfis', codigo: 'L 25', img: ['cantoneira', '#C3C7CC'], preco: 8.90, unidade: 'barra de 3 m', estoque: 300, desc: 'Protege e deixa retas as quinas externas. Usada nas quinas do gabinete.', destaque: 'Usada no DrywallPC' },

  // Forro
  { id: 'perfil-f530', nome: 'Perfil F530 para forro', cat: 'Forro', codigo: 'F530', img: ['perfil', '#D9DCDF'], preco: 19.90, unidade: 'barra de 3 m', estoque: 140, desc: 'Estrutura do forro de drywall, presa ao teto pelos reguladores.' },
  { id: 'tabica', nome: 'Tabica metálica para forro', cat: 'Forro', codigo: 'TAB', img: ['cantoneira', '#F4F3EF'], preco: 14.90, unidade: 'barra de 3 m', estoque: 90, desc: 'Acabamento entre o forro e a parede, com sombra reta.' },
  { id: 'regulador', nome: 'Regulador F530 com mola', cat: 'Forro', codigo: 'REG', img: ['regulador', '#C3C7CC'], preco: 39.90, unidade: 'pacote com 50', estoque: 30, desc: 'Ajusta a altura do forro na haste.' },
  { id: 'arame', nome: 'Arame galvanizado nº 10', cat: 'Forro', codigo: 'Nº 10', img: ['arame', '#AEB3B9'], preco: 34.90, unidade: 'rolo de 1 kg', estoque: 45, desc: 'Pendura a estrutura do forro na laje.' },
  { id: 'forro-pvc', nome: 'Forro de PVC branco 20 cm', cat: 'Forro', codigo: 'PVC', img: ['forro', '#F7F7F4'], preco: 24.90, unidade: 'm²', estoque: 200, desc: 'Réguas encaixáveis, laváveis, para varandas e áreas de serviço.' },

  // Fixação
  { id: 'paraf-placa', nome: 'Parafuso placa-perfil 25 mm', cat: 'Fixação', codigo: 'TA 25', img: ['parafuso', '#3B3E45'], preco: 11.90, unidade: 'caixa com 100', estoque: 90, desc: 'Ponta agulha, prende a placa no perfil.' },
  { id: 'paraf-metal', nome: 'Parafuso metal-metal 13 mm', cat: 'Fixação', codigo: 'LB 13', img: ['parafuso', '#9DA1A6'], preco: 13.90, unidade: 'caixa com 100', estoque: 70, desc: 'Cabeça lentilha, une montante e guia.' },
  { id: 'pino-aco', nome: 'Pino de aço com arruela', cat: 'Fixação', codigo: 'PINO', img: ['parafuso', '#6B6F76'], preco: 32.90, unidade: 'caixa com 100', estoque: 40, desc: 'Fixa a guia no piso ou na laje de concreto.' },
  { id: 'bucha', nome: 'Bucha basculante para drywall', cat: 'Fixação', codigo: 'BX 8', img: ['bucha', '#E8E2D0'], preco: 19.90, unidade: 'pacote com 25', estoque: 4, desc: 'Para pendurar TV, prateleira e armário na placa.' },
  { id: 'bucha-8', nome: 'Bucha de nylon 8 mm com parafuso', cat: 'Fixação', codigo: 'S8', img: ['bucha', '#FFC20E'], preco: 17.90, unidade: 'pacote com 50', estoque: 60, desc: 'Para paredes de alvenaria e concreto.' },

  // Acabamento
  { id: 'massa', nome: 'Massa para drywall', cat: 'Acabamento', codigo: '15 kg', img: ['balde', '#7DB46C'], preco: 64.90, unidade: 'balde de 15 kg', estoque: 35, desc: 'Pronta para uso, para juntas e cabeças de parafuso.' },
  { id: 'fita-papel', nome: 'Fita de papel microperfurada', cat: 'Acabamento', codigo: '150 m', img: ['fita', '#E9DCC0'], preco: 21.90, unidade: 'rolo de 150 m', estoque: 60, desc: 'Vai nas juntas entre as placas, coberta pela massa.' },
  { id: 'fita-telada', nome: 'Fita telada autoadesiva', cat: 'Acabamento', codigo: '90 m', img: ['fita', '#F2E6A0'], preco: 24.90, unidade: 'rolo de 90 m', estoque: 40, desc: 'Cola sozinha na junta, bom para reparos e trincas.' },
  { id: 'la-vidro', nome: 'Lã de vidro 50 mm', cat: 'Acabamento', codigo: 'LÃ 50', img: ['rolo-la', '#F2D58A'], preco: 129.90, unidade: 'rolo de 15 m²', estoque: 18, desc: 'Isolamento acústico e térmico dentro da parede.' },
  { id: 'la-rocha', nome: 'Lã de rocha 50 mm', cat: 'Acabamento', codigo: 'ROCHA', img: ['placa', '#C9A26A'], preco: 189.90, unidade: 'pacote de 4,3 m²', estoque: 12, desc: 'Painéis rígidos, isolam som e resistem ao fogo.' },
  { id: 'selador', nome: 'Selador acrílico', cat: 'Acabamento', codigo: '18 L', img: ['balde', '#6FA8DC'], preco: 119.90, unidade: 'balde de 18 L', estoque: 20, desc: 'Prepara a placa antes da pintura e economiza tinta.' },
  { id: 'tinta', nome: 'Tinta acrílica fosca branca', cat: 'Acabamento', codigo: '18 L', img: ['balde', '#FFC20E'], preco: 289.90, unidade: 'balde de 18 L', estoque: 15, desc: 'Rende cerca de 300 m² por demão.' },
  { id: 'lixa', nome: 'Lixa para massa nº 150', cat: 'Acabamento', codigo: 'Nº 150', img: ['lixa', '#D8B26E'], preco: 12.90, unidade: 'pacote com 10', estoque: 80, desc: 'Deixa as juntas lisas antes do selador.' },

  // Básicos de obra
  { id: 'cimento', nome: 'Cimento CP-II 50 kg', cat: 'Básicos de obra', codigo: '50 kg', img: ['saco', '#5F605C'], preco: 38.90, unidade: 'saco de 50 kg', estoque: 100, desc: 'Para contrapiso, reboco e concreto.' },
  { id: 'argamassa', nome: 'Argamassa AC-II 20 kg', cat: 'Básicos de obra', codigo: 'AC-II', img: ['saco', '#2E6FB7'], preco: 24.90, unidade: 'saco de 20 kg', estoque: 80, desc: 'Assenta piso e azulejo em áreas internas e externas.' },
  { id: 'areia', nome: 'Areia média ensacada', cat: 'Básicos de obra', codigo: '20 kg', img: ['saco', '#D9B36A'], preco: 7.90, unidade: 'saco de 20 kg', estoque: 150, desc: 'Lavada, para reboco e concreto.' },
  { id: 'cal', nome: 'Cal hidratada CH-III', cat: 'Básicos de obra', codigo: 'CAL', img: ['saco', '#C9CBC6'], preco: 17.90, unidade: 'saco de 20 kg', estoque: 60, desc: 'Deixa a argamassa mais trabalhável.' },
  { id: 'bloco', nome: 'Bloco cerâmico 9 × 19 × 19 cm', cat: 'Básicos de obra', codigo: '8 FUROS', img: ['bloco', '#C8643C'], preco: 2.10, unidade: 'unidade', estoque: 2000, desc: 'Tijolo baiano de 8 furos para alvenaria de vedação.' },

  // Ferramentas
  { id: 'parafusadeira', nome: 'Parafusadeira a bateria 12 V', cat: 'Ferramentas', codigo: '12 V', img: ['parafusadeira', '#FFC20E'], preco: 349.00, unidade: 'unidade', estoque: 8, desc: 'Com controle de torque, para não afundar o parafuso no gesso.', destaque: 'Usada no DrywallPC' },
  { id: 'trena', nome: 'Trena 5 m', cat: 'Ferramentas', codigo: '5 m', img: ['trena', '#FFC20E'], preco: 29.90, unidade: 'unidade', estoque: 25, desc: 'Trava automática e fita de aço.', destaque: 'Usada no DrywallPC' },
  { id: 'espatula', nome: 'Espátula de aço 15 cm', cat: 'Ferramentas', codigo: '15 cm', img: ['espatula', '#C8643C'], preco: 18.90, unidade: 'unidade', estoque: 30, desc: 'Para aplicar e alisar a massa.', destaque: 'Usada no DrywallPC' },
  { id: 'estilete', nome: 'Estilete profissional', cat: 'Ferramentas', codigo: '18 mm', img: ['estilete', '#FFC20E'], preco: 14.90, unidade: 'unidade', estoque: 3, desc: 'Corta a placa: risca o papel, quebra e acerta o outro lado.' },
  { id: 'serrote', nome: 'Serrote para gesso', cat: 'Ferramentas', codigo: 'SERR', img: ['serrote', '#C8643C'], preco: 34.90, unidade: 'unidade', estoque: 20, desc: 'Abre furos para caixas de luz e recortes na placa.' },
  { id: 'nivel', nome: 'Nível de alumínio 60 cm', cat: 'Ferramentas', codigo: '60 cm', img: ['nivel', '#FFC20E'], preco: 39.90, unidade: 'unidade', estoque: 18, desc: 'Confere prumo dos montantes e nível das guias.' },
  { id: 'alicate', nome: 'Alicate puncionador', cat: 'Ferramentas', codigo: 'PUNC', img: ['alicate', '#D9443C'], preco: 89.90, unidade: 'unidade', estoque: 6, desc: 'Une guia e montante sem parafuso.' },
  { id: 'martelo', nome: 'Martelo unha 27 mm', cat: 'Ferramentas', codigo: '27 mm', img: ['martelo', '#C99A5B'], preco: 44.90, unidade: 'unidade', estoque: 22, desc: 'Cabo de madeira, para serviços gerais da obra.' },
  { id: 'rolo-pintura', nome: 'Rolo de lã 23 cm com cabo', cat: 'Ferramentas', codigo: '23 cm', img: ['rolo-pintura', '#FFC20E'], preco: 32.90, unidade: 'unidade', estoque: 30, desc: 'Para selador e tinta em paredes lisas.' },

  // EPI
  { id: 'capacete', nome: 'Capacete de segurança', cat: 'EPI', codigo: 'CA', img: ['capacete', '#FFC20E'], preco: 29.90, unidade: 'unidade', estoque: 40, desc: 'Com carneira ajustável. Obrigatório na obra.' },
  { id: 'oculos', nome: 'Óculos de proteção incolor', cat: 'EPI', codigo: 'CA', img: ['oculos', '#BFDDF0'], preco: 12.90, unidade: 'unidade', estoque: 60, desc: 'Protege do pó de gesso ao cortar e lixar.' },
  { id: 'luva', nome: 'Luva de proteção', cat: 'EPI', codigo: 'PAR', img: ['luva', '#FFC20E'], preco: 9.90, unidade: 'par', estoque: 100, desc: 'Palma emborrachada, boa pegada para placas e perfis.' },
  { id: 'mascara', nome: 'Máscara PFF2', cat: 'EPI', codigo: 'PFF2', img: ['mascara', '#F4F3EF'], preco: 34.90, unidade: 'pacote com 10', estoque: 50, desc: 'Filtra o pó fino da massa na hora de lixar.' },

  // Kits
  { id: 'kit-gabinete', nome: 'Kit Gabinete DrywallPC', cat: 'Kits', codigo: 'KIT PC', img: ['kit', '#7DB46C'], preco: 199.00, unidade: 'kit', estoque: 5, desc: 'Placas RU cortadas para um cubo de 40 cm, cantoneiras e parafusos. Monte o seu.', destaque: 'Exclusivo' }
];
