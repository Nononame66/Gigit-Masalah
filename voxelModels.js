/* ==========================================================
   Gigit Masalah – LOW-POLY STYLIZED Models & 15 Species Catalog
   Faceted / flat-shaded look (Fisch-style), replaces old voxel set.
   Same exports as before -> drop-in replacement, no other file
   needs to change.
   ========================================================== */

import * as THREE from 'three';

const materialCache = {};

function getHDMaterial(color, roughness = 0.6, metalness = 0.05, emissive = 0x000000) {
  const key = `${color}_${roughness}_${metalness}_${emissive}`;
  if (!materialCache[key]) {
    materialCache[key] = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      emissive,
      flatShading: true // <- the "low-poly facet" look
    });
  }
  return materialCache[key];
}

/* ==========================================================
   1. PLAYER CHARACTER — low-poly faceted humanoid
   ========================================================== */
export function createVoxelPlayer() {
  const playerGroup = new THREE.Group();

  const C_SKIN   = 0x9c6b4a;
  const C_HAIR   = 0x18181b;
  const C_SHIRT  = 0xe23b3b;
  const C_TRIM   = 0x1f7a4d;
  const C_SHORTS = 0x1f7a4d;
  const C_SOCKS  = 0xe23b3b;
  const C_SHOES  = 0x22262e;
  const C_SOLE   = 0xf4f1ea;

  const SEG = 6; // low segment count = visible facets

  /* --- Left Leg --- */
  const leftLegGroup = new THREE.Group();
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.36), getHDMaterial(C_SHOES));
  leftShoe.position.set(0, 0.09, 0.05);
  leftShoe.castShadow = true;
  leftLegGroup.add(leftShoe);
  const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.37), getHDMaterial(C_SOLE, 0.4));
  leftSole.position.set(0, 0.02, 0.05);
  leftLegGroup.add(leftSole);
  const leftSock = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.4, SEG), getHDMaterial(C_SOCKS));
  leftSock.position.set(0, 0.3, 0);
  leftSock.castShadow = true;
  leftLegGroup.add(leftSock);
  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.5, SEG), getHDMaterial(C_SHORTS));
  leftThigh.position.set(0, 0.7, 0);
  leftThigh.castShadow = true;
  leftLegGroup.add(leftThigh);
  leftLegGroup.position.set(-0.2, 0, 0);

  /* --- Right Leg --- */
  const rightLegGroup = new THREE.Group();
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.36), getHDMaterial(C_SHOES));
  rightShoe.position.set(0, 0.09, 0.05);
  rightShoe.castShadow = true;
  rightLegGroup.add(rightShoe);
  const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.37), getHDMaterial(C_SOLE, 0.4));
  rightSole.position.set(0, 0.02, 0.05);
  rightLegGroup.add(rightSole);
  const rightSock = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.4, SEG), getHDMaterial(C_SOCKS));
  rightSock.position.set(0, 0.3, 0);
  rightSock.castShadow = true;
  rightLegGroup.add(rightSock);
  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.5, SEG), getHDMaterial(C_SHORTS));
  rightThigh.position.set(0, 0.7, 0);
  rightThigh.castShadow = true;
  rightLegGroup.add(rightThigh);
  rightLegGroup.position.set(0.2, 0, 0);

  /* --- Torso --- */
  const torsoGroup = new THREE.Group();
  const shirtBody = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.24, 0.85, SEG + 2), getHDMaterial(C_SHIRT));
  shirtBody.position.set(0, 1.35, 0);
  shirtBody.castShadow = true;
  torsoGroup.add(shirtBody);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 5, SEG), getHDMaterial(C_TRIM, 0.5));
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 1.77, 0);
  torsoGroup.add(collar);

  /* --- Arms --- */
  const makeArm = (side) => {
    const g = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.2, SEG), getHDMaterial(C_SHIRT));
    sleeve.position.set(0, 1.6, 0);
    g.add(sleeve);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.55, SEG), getHDMaterial(C_SKIN, 0.7));
    arm.position.set(0, 1.25, 0);
    arm.castShadow = true;
    g.add(arm);
    const hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), getHDMaterial(C_SKIN, 0.7));
    hand.position.set(0, 0.95, 0);
    g.add(hand);
    g.position.set(side * 0.36, 0, 0);
    return g;
  };
  const leftArmGroup  = makeArm(-1);
  const rightArmGroup = makeArm(1);

  /* --- Head --- */
  const headGroup = new THREE.Group();
  const headMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), getHDMaterial(C_SKIN, 0.7));
  headMesh.position.set(0, 2.02, 0);
  headMesh.castShadow = true;
  headGroup.add(headMesh);
  const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), getHDMaterial(C_HAIR, 0.9));
  hair.position.set(0, 2.17, -0.04);
  hair.castShadow = true;
  headGroup.add(hair);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.02), getHDMaterial(0xffffff, 0.3));
  mouth.position.set(0, 1.95, 0.23);
  headGroup.add(mouth);
  const eyeGeo = new THREE.IcosahedronGeometry(0.03, 0);
  const eyeMat = getHDMaterial(0x000000, 0.2);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.08, 2.06, 0.22);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.08, 2.06, 0.22);
  headGroup.add(leftEye, rightEye);

  playerGroup.add(leftLegGroup, rightLegGroup, torsoGroup, leftArmGroup, rightArmGroup, headGroup);

  playerGroup.userData = {
    leftLeg: leftLegGroup,
    rightLeg: rightLegGroup,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    head: headGroup
  };

  return playerGroup;
}

/* ==========================================================
   2. FISHING ROD — low-poly faceted
   ========================================================== */
export function createVoxelRod(rodType = 'rod_wooden') {
  const group = new THREE.Group();

  let C_ROD = 0x8a5a2b;
  let C_REEL = 0xaab4c0;

  if (rodType === 'rod_bamboo') C_ROD = 0x2e9c5c;
  if (rodType === 'rod_carbon') C_ROD = 0x3c4657;
  if (rodType === 'rod_golden') C_ROD = 0xf2a93b;
  if (rodType === 'rod_cosmic') C_ROD = 0x9d6bf0;

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), getHDMaterial(0x1e293b, 0.4));
  handle.position.set(0, 0.2, 0);
  group.add(handle);

  const reel = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), getHDMaterial(C_REEL, 0.3, 0.7));
  reel.position.set(0, 0.4, 0.06);
  group.add(reel);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.035, 2.4, 6),
    getHDMaterial(C_ROD, 0.35, 0.15, rodType === 'rod_cosmic' ? 0x4c1d95 : 0)
  );
  shaft.rotation.x = Math.PI / 4;
  shaft.position.set(0, 1.2, 0.8);
  shaft.castShadow = true;
  group.add(shaft);

  return group;
}

/* ==========================================================
   3. BOBBER / FLOAT — faceted two-tone sphere
   ========================================================== */
export function createVoxelBobber() {
  const group = new THREE.Group();
  const top = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), getHDMaterial(0x1fae7a, 0.3));
  top.position.set(0, 0.12, 0);
  group.add(top);
  const bottom = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 1), getHDMaterial(0xf2a93b, 0.3));
  bottom.position.set(0, -0.04, 0);
  group.add(bottom);
  return group;
}

/* ==========================================================
   4. PIER — faceted wood planks + faceted piling posts
   ========================================================== */
export function createVoxelPier() {
  const group = new THREE.Group();

  const C_PLANK1 = 0x8b5e3c;
  const C_PLANK2 = 0xa3703f;
  const C_PILLAR = 0x4a3323;

  for (let z = 0; z <= 24; z += 1.2) {
    const color = (Math.floor(z) % 2 === 0) ? C_PLANK1 : C_PLANK2;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 1.1), getHDMaterial(color, 0.75));
    plank.position.set(0, 0, z);
    plank.receiveShadow = true;
    plank.castShadow = true;
    group.add(plank);
  }

  const pillars = [[-1.2, 0], [1.2, 0], [-1.2, 8], [1.2, 8], [-1.2, 16], [1.2, 16], [-1.2, 24], [1.2, 24]];
  pillars.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 4, 6), getHDMaterial(C_PILLAR, 0.85));
    pillar.position.set(px, -2, pz);
    pillar.castShadow = true;
    group.add(pillar);
  });

  for (let z = 0; z <= 24; z += 4) {
    const postLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5), getHDMaterial(C_PILLAR, 0.8));
    postLeft.position.set(-1.35, 0.5, z);
    group.add(postLeft);
    const postRight = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 5), getHDMaterial(C_PILLAR, 0.8));
    postRight.position.set(1.35, 0.5, z);
    group.add(postRight);
  }

  return group;
}

/* ==========================================================
   5. TREE — faceted stylized palm/foliage cluster
   ========================================================== */
export function createVoxelTree() {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 3.4, 6), getHDMaterial(0x6b4a30, 0.85));
  trunk.position.set(0, 1.7, 0);
  trunk.rotation.z = (Math.random() - 0.5) * 0.12;
  trunk.castShadow = true;
  group.add(trunk);

  // layered faceted foliage clusters for a fuller stylized canopy
  const hue = 0.32 + (Math.random() - 0.5) * 0.05;
  const foliageColor = new THREE.Color().setHSL(hue, 0.55, 0.38 + Math.random() * 0.08);
  const foliageMat = getHDMaterial(foliageColor.getHex(), 0.7);

  const cap1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), foliageMat);
  cap1.position.set(0, 3.4, 0);
  cap1.scale.set(1, 0.8, 1);
  cap1.castShadow = true;
  group.add(cap1);

  const cap2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), foliageMat);
  cap2.position.set(0.5, 4.1, 0.2);
  cap2.castShadow = true;
  group.add(cap2);

  const cap3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), foliageMat);
  cap3.position.set(-0.45, 3.9, -0.3);
  cap3.castShadow = true;
  group.add(cap3);

  return group;
}

/* ==========================================================
   6. 15 GIGITAN KADAL SPECIES CATALOG WITH LORE & XP
   (unchanged data — only the render style below is faceted)
   ========================================================== */
export const FISH_SPECIES = [
  { id: 'kadal_air', name: 'Kadal Air Hijau', rarity: 'Common', rarityColor: '#94a3b8', minWeight: 0.8, maxWeight: 2.5, basePrice: 25, xpReward: 15, desc: 'Kadal air kecil yang lincah berenang di tepi pantai.', symbol: '🦎', colors: [0x10b981, 0x047857, 0xa7f3d0] },
  { id: 'perch', name: 'Perch Sungai Kadal', rarity: 'Common', rarityColor: '#94a3b8', minWeight: 0.5, maxWeight: 1.8, basePrice: 30, xpReward: 20, desc: 'Ikan sungai bersisik hijau bercorak kadal.', symbol: '🐠', colors: [0x15803d, 0x4ade80, 0xfacc15] },
  { id: 'salmon', name: 'Salmon Sisik Pelangi', rarity: 'Common', rarityColor: '#94a3b8', minWeight: 1.5, maxWeight: 4.2, basePrice: 45, xpReward: 25, desc: 'Daging segar berkilat sisik pelangi emas.', symbol: '🐟', colors: [0xf43f5e, 0xfb7185, 0xe2e8f0] },
  { id: 'koi', name: 'Koi Emas Mahkota', rarity: 'Rare', rarityColor: '#3b82f6', minWeight: 2.0, maxWeight: 5.5, basePrice: 95, xpReward: 50, desc: 'Koi berkilau jingga keemasan pencetus keberuntungan.', symbol: '🐡', colors: [0xf97316, 0xfbac41, 0xffffff] },
  { id: 'biawak', name: 'Biawak Rawa Air', rarity: 'Rare', rarityColor: '#3b82f6', minWeight: 3.5, maxWeight: 8.5, basePrice: 140, xpReward: 65, desc: 'Predator rawa purba yang tangguh dan memikat.', symbol: '🐊', colors: [0x334155, 0x475569, 0x10b981] },
  { id: 'salamander', name: 'Salamander Neon HD', rarity: 'Rare', rarityColor: '#3b82f6', minWeight: 1.8, maxWeight: 4.5, basePrice: 160, xpReward: 75, desc: 'Salamander air berpendar warna cyan cerah.', symbol: '🦎', colors: [0x06b6d4, 0x67e8f9, 0xfef08a] },
  { id: 'kepiting', name: 'Kepiting Kadal Red', rarity: 'Rare', rarityColor: '#3b82f6', minWeight: 1.0, maxWeight: 3.0, basePrice: 180, xpReward: 85, desc: 'Kepiting bercangkang merah kuat dengan capit tajam.', symbol: '🦀', colors: [0xef4444, 0xd97706, 0xffffff] },
  { id: 'axolotl', name: 'Cyber Axolotl Neon', rarity: 'Epic', rarityColor: '#a855f7', minWeight: 1.2, maxWeight: 3.8, basePrice: 260, xpReward: 120, desc: 'Axolotl misterius bermahkota merah magenta menyala.', symbol: '👾', colors: [0xec4899, 0xf472b6, 0x06b6d4] },
  { id: 'komodo', name: 'Kadal Komodo Purba', rarity: 'Epic', rarityColor: '#a855f7', minWeight: 15.0, maxWeight: 45.0, basePrice: 380, xpReward: 180, desc: 'Raja kadal raksasa yang berenang di kedalaman samudera.', symbol: '🐉', colors: [0x854d0e, 0xa16207, 0xfef08a] },
  { id: 'cumi', name: 'Cumi-Cumi Raksasa', rarity: 'Epic', rarityColor: '#a855f7', minWeight: 8.0, maxWeight: 22.0, basePrice: 450, xpReward: 220, desc: 'Cumi-cumi samudra berbadan keunguan dengan tentakel panjang.', symbol: '🦑', colors: [0x7c3aed, 0xc084fc, 0x06b6d4] },
  { id: 'shark', name: 'Hiu Samudra Kadal', rarity: 'Legendary', rarityColor: '#f59e0b', minWeight: 20.0, maxWeight: 50.0, basePrice: 700, xpReward: 350, desc: 'Hiu bersisik kadal tebal dengan sirip tajam.', symbol: '🦈', colors: [0x475569, 0x64748b, 0xf8fafc] },
  { id: 'lava_kadal', name: 'Naga Kadal Lava', rarity: 'Legendary', rarityColor: '#f59e0b', minWeight: 12.0, maxWeight: 30.0, basePrice: 900, xpReward: 450, desc: 'Berasal dari danau magma, memancarkan panas lava membara.', symbol: '🔥', colors: [0x18181b, 0xea580c, 0xfacc15] },
  { id: 'golden_kadal', name: 'Kadal Raja Emas', rarity: 'Legendary', rarityColor: '#f59e0b', minWeight: 10.0, maxWeight: 28.0, basePrice: 1200, xpReward: 600, desc: 'Kadal raja berlapis emas murni berkilau di perairan.', symbol: '👑', colors: [0xf59e0b, 0xfef08a, 0xffffff] },
  { id: 'leviathan', name: 'Glitched Leviathan Kadal', rarity: 'Mythic', rarityColor: '#ec4899', minWeight: 35.0, maxWeight: 95.0, basePrice: 1800, xpReward: 900, desc: 'Naga kadal purba bersisik kristal neon raksasa.', symbol: '🐲', colors: [0x581c87, 0xa855f7, 0x06b6d4] },
  { id: 'cosmic_dragon', name: 'Naga Kosmik Bintang', rarity: 'Mythic', rarityColor: '#ec4899', minWeight: 40.0, maxWeight: 120.0, basePrice: 2500, xpReward: 1200, desc: 'Naga kosmik pencipta samudera berpendar cahaya bintang.', symbol: '🌌', colors: [0x312e81, 0x818cf8, 0xf472b6] }
];

export function createVoxelFishModel(fishId) {
  const species = FISH_SPECIES.find(f => f.id === fishId) || FISH_SPECIES[0];
  const group = new THREE.Group();
  const [c1, c2, c3] = species.colors;

  const isBig = species.rarity === 'Legendary' || species.rarity === 'Mythic';
  const scale = isBig ? 1.6 : 1.0;

  const body = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.36 * scale, 1),
    getHDMaterial(c1, 0.35, 0.15, species.rarity === 'Mythic' ? 0x581c87 : 0)
  );
  body.scale.set(1.0, 1.15, 2.1);
  body.castShadow = true;
  group.add(body);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.25 * scale, 0.6 * scale, 3), getHDMaterial(c2, 0.45));
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0, 0, -0.7 * scale);
  group.add(tail);

  const fin = new THREE.Mesh(new THREE.ConeGeometry(0.15 * scale, 0.4 * scale, 3), getHDMaterial(c3, 0.45));
  fin.position.set(0, 0.4 * scale, 0);
  group.add(fin);

  return group;
}

/* ==========================================================
   7. JUNK ITEM 3D PREVIEW MODELS — faceted low-poly loot
   ========================================================== */
export function createVoxelJunkModel(junkId) {
  const group = new THREE.Group();

  switch (junkId) {
    case 'kayu': {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.5, 6), getHDMaterial(0x8a5a34, 0.85));
      log.rotation.z = Math.PI / 2.4;
      log.castShadow = true;
      group.add(log);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 6), getHDMaterial(0xc9975f, 0.7));
      cap.rotation.z = Math.PI / 2.4;
      cap.position.set(0.62, 0.28, 0);
      group.add(cap);
      break;
    }
    case 'batu': {
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), getHDMaterial(0x8d8f99, 0.8));
      rock.scale.set(1, 0.75, 0.9);
      rock.castShadow = true;
      group.add(rock);
      break;
    }
    case 'botol': {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.9, 6), getHDMaterial(0x6ee7c7, 0.3, 0.1));
      body.position.y = 0.1;
      body.castShadow = true;
      group.add(body);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 0.35, 6), getHDMaterial(0x6ee7c7, 0.3, 0.1));
      neck.position.y = 0.72;
      group.add(neck);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6), getHDMaterial(0x1e293b, 0.5));
      cap.position.y = 0.93;
      group.add(cap);
      break;
    }
    case 'sendal': {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 1.0), getHDMaterial(0x1f9c6e, 0.75));
      sole.position.y = 0;
      sole.castShadow = true;
      group.add(sole);
      const strapMat = getHDMaterial(0x0f766e, 0.6);
      const strapA = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 5), strapMat);
      strapA.rotation.z = Math.PI / 2.6;
      strapA.position.set(0.06, 0.12, 0.18);
      group.add(strapA);
      const strapB = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 5), strapMat);
      strapB.rotation.z = -Math.PI / 2.6;
      strapB.position.set(-0.06, 0.12, 0.18);
      group.add(strapB);
      break;
    }
    case 'kaleng': {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.75, 8), getHDMaterial(0xc0392b, 0.4, 0.5));
      can.castShadow = true;
      group.add(can);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 4, 8), getHDMaterial(0x94a3b8, 0.3, 0.6));
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.38;
      group.add(rim);
      break;
    }
    case 'ban': {
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.2, 8, 12), getHDMaterial(0x1c1917, 0.9));
      tire.castShadow = true;
      group.add(tire);
      break;
    }
    case 'topi': {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 10), getHDMaterial(0xd4a373, 0.8));
      group.add(brim);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 0.35, 8), getHDMaterial(0xbc8a5f, 0.8));
      top.position.y = 0.2;
      top.castShadow = true;
      group.add(top);
      break;
    }
    default: {
      const fallback = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), getHDMaterial(0x94a3b8, 0.7));
      group.add(fallback);
    }
  }

  return group;
}
