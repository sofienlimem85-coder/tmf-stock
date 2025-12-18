import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Movement, MovementDocument } from '../movements/schemas/movement.schema';

/**
 * Normalise un nom de produit pour la comparaison
 * - Convertit en minuscules
 * - Supprime les accents
 * - Supprime les espaces multiples
 * - Trim les espaces en début/fin
 */
function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, ' ') // Remplace les espaces multiples par un seul
    .trim();
}

type FindAllOptions = {
  search?: string;
  type?: 'TYPE1' | 'TYPE2';
  sortBy?: 'name' | 'quantity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Movement.name)
    private readonly movementModel: Model<MovementDocument>,
  ) {}

  async create(dto: CreateProductDto) {
    const normalizedName = normalizeProductName(dto.name);
    
    // Chercher un produit existant avec le même nom normalisé et le même type
    // On cherche d'abord par normalizedName (produits récents)
    let existingProduct = await this.productModel.findOne({
      normalizedName,
      type: dto.type,
    }).exec();

    // Si pas trouvé, chercher parmi les produits du même type en normalisant leur nom
    if (!existingProduct) {
      const productsOfSameType = await this.productModel.find({
        type: dto.type,
      }).exec();

      // Chercher un produit avec le même nom normalisé
      for (const product of productsOfSameType) {
        const productNormalizedName = product.normalizedName 
          ? product.normalizedName 
          : normalizeProductName(product.name);
        
        if (productNormalizedName === normalizedName) {
          existingProduct = product;
          break;
        }
      }
    }

    if (existingProduct) {
      // Si le produit existe, ajouter la quantité
      const oldQuantity = existingProduct.quantity;
      existingProduct.quantity += dto.quantity;
      
      // Mettre à jour normalizedName si ce n'est pas déjà fait
      if (!existingProduct.normalizedName) {
        existingProduct.normalizedName = normalizedName;
      }
      
      // Mettre à jour le numéro de facture seulement s'il est fourni et que le produit n'en a pas déjà un
      if (dto.invoiceNumber && !existingProduct.invoiceNumber) {
        existingProduct.invoiceNumber = dto.invoiceNumber;
      }
      
      // NE PAS mettre à jour l'image de facture si le produit existe déjà
      // L'image de facture ne doit être mise à jour que lors de la création d'un nouveau produit
      // Si on veut changer l'image, il faut modifier le produit explicitement
      
      await existingProduct.save();
      
      // Créer un mouvement d'entrée pour cette quantité ajoutée
      const movement = new this.movementModel({
        productId: existingProduct._id.toString(),
        quantity: dto.quantity,
        type: 'ENTREE',
        comment: dto.comment || 'Ajout de stock',
        invoiceNumber: dto.invoiceNumber || undefined,
        invoiceAttachment: dto.invoiceAttachment || undefined,
      });
      await movement.save();
      
      const productObj = existingProduct.toObject();
      return {
        ...productObj,
        status: this.getStatus(existingProduct.quantity),
      };
    }

    // Si le produit n'existe pas, créer un nouveau produit
    const created = new this.productModel({
      ...dto,
      normalizedName,
    });
    await created.save();
    
    // Créer un mouvement d'entrée pour ce nouveau produit
    const movement = new this.movementModel({
      productId: created._id.toString(),
      quantity: dto.quantity,
      type: 'ENTREE',
      comment: dto.comment || 'Création du produit',
      invoiceNumber: dto.invoiceNumber || undefined,
      invoiceAttachment: dto.invoiceAttachment || undefined,
    });
    await movement.save();
    
    const productObj = created.toObject();
    return {
      ...productObj,
      status: this.getStatus(created.quantity),
    };
  }

  async findAll(options: FindAllOptions = {}) {
    const {
      search,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = options;

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    const productsWithStatus = data.map((product) => ({
      ...product.toObject(),
      status: this.getStatus(product.quantity),
    }));

    return {
      data: productsWithStatus,
      total,
      page,
      limit,
      hasNextPage: skip + limit < total,
    };
  }

  async findOne(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const productObj = product.toObject();
    return {
      ...productObj,
      status: this.getStatus(product.quantity),
    };
  }

  async update(id: string, dto: UpdateProductDto) {
    const updateData: any = { ...dto };
    
    // Si le nom est modifié, normaliser le nom
    if (dto.name) {
      updateData.normalizedName = normalizeProductName(dto.name);
    }
    
    const product = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const productObj = product.toObject();
    return {
      ...productObj,
      status: this.getStatus(product.quantity),
    };
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private getStatus(quantity: number): ProductStatus {
    return quantity > 0 ? 'disponible' : 'stock_vide';
  }
}


