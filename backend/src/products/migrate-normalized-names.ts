/**
 * Script de migration pour normaliser les noms des produits existants
 * 
 * Ce script doit être exécuté une seule fois pour ajouter le champ normalizedName
 * aux produits existants dans la base de données.
 * 
 * Usage: 
 *   ts-node src/products/migrate-normalized-names.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { connect, disconnect } from 'mongoose';

/**
 * Normalise un nom de produit pour la comparaison
 */
function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, ' ') // Remplace les espaces multiples par un seul
    .trim();
}

async function migrate() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tmf_stock';
  
  try {
    console.log('🔌 Connexion à MongoDB...');
    await connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Importer le modèle Product
    const { ProductSchema } = await import('./schemas/product.schema');
    const mongoose = await import('mongoose');
    const Product = mongoose.default.models.Product || mongoose.default.model('Product', ProductSchema);

    console.log('📦 Recherche des produits sans normalizedName...');
    const products = await Product.find({ normalizedName: { $exists: false } }).exec();
    
    if (products.length === 0) {
      console.log('✅ Tous les produits ont déjà un normalizedName');
      return;
    }

    console.log(`📝 Trouvé ${products.length} produit(s) à migrer`);

    let updated = 0;
    for (const product of products) {
      const normalizedName = normalizeProductName(product.name);
      product.normalizedName = normalizedName;
      await product.save();
      updated++;
      console.log(`  ✓ "${product.name}" → normalizedName: "${normalizedName}"`);
    }

    console.log(`\n✅ Migration terminée: ${updated} produit(s) mis à jour`);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la migration
migrate()
  .then(() => {
    console.log('🎉 Migration réussie!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Échec de la migration:', error);
    process.exit(1);
  });

