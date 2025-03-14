"use client";

import { useState } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Product {
  id: string;
  name: string;
  price: number;
  imageURL: string;
}

interface ProductsNodeProps {
  data: {
    products: Product[];
  };
  isConnectable: boolean;
}

export function ProductsNode({ data, isConnectable }: ProductsNodeProps) {
  const [products, setProducts] = useState<Product[]>(data.products);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    imageURL: "",
  });
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  // Add a new product
  const handleAddProduct = () => {
    if (!newProduct.name.trim()) return;

    const newProductItem = {
      id: Date.now().toString(),
      name: newProduct.name.trim(),
      price: newProduct.price,
      imageURL:
        newProduct.imageURL.trim() ||
        `https://picsum.photos/300/300?random=${Date.now()}`,
    };

    const updatedProducts = [...products, newProductItem];
    setProducts(updatedProducts);
    data.products = updatedProducts;
    setNewProduct({
      name: "",
      price: 0,
      imageURL: "",
    });
  };

  // Remove a product
  const handleRemoveProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    data.products = updatedProducts;
  };

  // Update a product
  const handleUpdateProduct = (
    id: string,
    field: keyof Product,
    value: string | number
  ) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
    data.products = updatedProducts;
  };

  // Toggle product details
  const toggleProductDetails = (id: string) => {
    setOpenProductId(openProductId === id ? null : id);
  };

  return (
    <Card className="w-96">
      <CardHeader className="bg-amber-500 text-white py-2">
        <CardTitle className="text-base">Products</CardTitle>
      </CardHeader>
      <CardContent className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-3">
          <Label>Available Products</Label>
          <div className="space-y-2">
            {products.map((product) => (
              <Collapsible
                key={product.id}
                open={openProductId === product.id}
                onOpenChange={() => toggleProductDetails(product.id)}
                className="border rounded-md"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted">
                  <span className="font-medium">{product.name}</span>
                  {openProductId === product.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-2 border-t">
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`product-name-${product.id}`}>Name</Label>
                      <Input
                        id={`product-name-${product.id}`}
                        value={product.name}
                        onChange={(e) =>
                          handleUpdateProduct(
                            product.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`product-price-${product.id}`}>
                        Price
                      </Label>
                      <Input
                        id={`product-price-${product.id}`}
                        type="number"
                        value={product.price}
                        onChange={(e) =>
                          handleUpdateProduct(
                            product.id,
                            "price",
                            Number.parseFloat(e.target.value)
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`product-image-${product.id}`}>
                        Image URL
                      </Label>
                      <Input
                        id={`product-image-${product.id}`}
                        value={product.imageURL}
                        onChange={(e) =>
                          handleUpdateProduct(
                            product.id,
                            "imageURL",
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          <div className="space-y-2 border-t pt-3">
            <Label>Add New Product</Label>
            <div>
              <Label htmlFor="new-product-name">Name</Label>
              <Input
                id="new-product-name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                placeholder="Product name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-product-price">Price</Label>
              <Input
                id="new-product-price"
                type="number"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: Number.parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-product-image">Image URL (optional)</Label>
              <Input
                id="new-product-image"
                value={newProduct.imageURL}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, imageURL: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleAddProduct}
              disabled={!newProduct.name.trim()}
              className="w-full mt-2"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </div>
        </div>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-amber-500"
      />
    </Card>
  );
}
