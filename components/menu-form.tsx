"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MenuCategory, MenuSubCategory, MenuFormData, MenuItemData } from "@/types/menu"
import { Camera, X, Plus, Trash2, Wand2, FileText, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface MenuFormProps {
  initialData?: Partial<MenuFormData>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export function MenuForm({ initialData, onSubmit, onCancel, isLoading }: MenuFormProps) {
  const { toast } = useToast()
  const [date] = useState(initialData?.date || new Date().toISOString().split("T")[0])
  const [category, setCategory] = useState<MenuCategory>(initialData?.category || "Buffet")
  const [subcategory, setSubcategory] = useState<MenuSubCategory | undefined>(initialData?.subcategory)
  
  const [items, setItems] = useState<MenuItemData[]>(initialData?.items || [{
      name: "",
      description: "",
      image_url: ""
  }])

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleAddItem = () => {
    setItems([...items, { name: "", description: "", image_url: "" }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof MenuItemData, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    
    reader.onload = async (event) => {
        const text = event.target?.result
        if (typeof text !== "string") {
            setIsImporting(false)
            return
        }

        try {
            const res = await fetch("/api/analyze-menu-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            })

            const data = await res.json()

            if (res.ok && data.items && Array.isArray(data.items)) {
                
                // Convert to MenuItemData structure (add empty image_url)
                const newItems: MenuItemData[] = data.items.map((item: any) => ({
                    name: item.name,
                    description: item.description || "",
                    image_url: ""
                }))

                // If current list is just one empty item, replace it. Else append.
                if (items.length === 1 && !items[0].name && !items[0].description) {
                    setItems(newItems)
                } else {
                    setItems([...items, ...newItems])
                }

                if (data.mock) {
                     toast({
                        title: "Modo Demonstração",
                        description: "Itens gerados mockados. Configure GOOGLE_API_KEY para usar IA real.",
                        variant: "destructive"
                    })
                } else {
                    toast({
                        title: "Sucesso!",
                        description: `${newItems.length} itens importados do arquivo.`,
                    })
                }
            } else {
                 throw new Error(data.error || "Falha ao processar arquivo")
            }
        } catch (error) {
            console.error(error)
             toast({
                title: "Erro na importação",
                description: "Não foi possível processar o arquivo de texto.",
                variant: "destructive"
            })
        } finally {
            setIsImporting(false)
            // Reset input
            e.target.value = ""
        }
    }

    reader.readAsText(file)
  }

  const analyzeImage = async (index: number, imageUrl: string) => {
    setAnalyzingIndex(index)
    try {
        const res = await fetch("/api/analyze-menu-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageUrl }),
        })
        
        const data = await res.json()
        
        if (res.ok) {
            setItems(prevItems => {
                const newItems = [...prevItems]
                if (data.name) newItems[index] = { ...newItems[index], name: data.name }
                if (data.description) newItems[index] = { ...newItems[index], description: data.description }
                return newItems
            })

            if (data.mock) {
                toast({
                    title: "Modo Demonstração (Grátis)",
                    description: "Configure sua CHAVE GOOGLE (Gemini) no arquivo .env.local para análise real.",
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Imagem analisada!",
                    description: "Campos preenchidos automaticamente com IA.",
                })
            }
        } else {
            console.error(data.error)
            toast({
                title: "Erro API",
                description: data.error || "Erro ao conectar com servidor de análise.",
                variant: "destructive"
            })
        }
    } catch (error) {
        console.error("Error analyzing image:", error)
        toast({
            title: "Erro na análise",
            description: "Não foi possível analisar a imagem automaticamente.",
            variant: "destructive",
        })
    } finally {
        setAnalyzingIndex(null)
    }
  }

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(index)
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      handleItemChange(index, "image_url", result)
      setUploadingIndex(null)
      // Trigger analysis automatically
      analyzeImage(index, result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      date,
      category,
      subcategory: category === 'Churrasco' ? subcategory : undefined,
      items
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as MenuCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buffet">Buffet</SelectItem>
                <SelectItem value="Sushi">Sushi</SelectItem>
                <SelectItem value="Churrasco">Churrasco</SelectItem>
                <SelectItem value="Sobremesa">Sobremesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {category === "Churrasco" && (
          <div className="space-y-2">
            <Label>Tipo de Churrasco</Label>
            <Select
              value={subcategory}
              onValueChange={(value) => setSubcategory(value as MenuSubCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pré-assada">Pré-assada</SelectItem>
                <SelectItem value="In natura">In natura</SelectItem>
                <SelectItem value="Sobra">Sobra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Itens do Cardápio</Label>
            <label className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" disabled={isImporting} className="gap-2" onClick={() => document.getElementById('file-upload')?.click()}>
                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Importar do Texto
                </Button>
                <input 
                    id="file-upload"
                    type="file" 
                    accept=".txt,.md,.csv,.json"
                    className="hidden" 
                    onChange={handleFileImport}
                    disabled={isImporting}
                />
            </label>
        </div>
        
        {items.map((item, index) => (
            <div key={index} className="space-y-4 rounded-lg border p-4 bg-slate-50 relative">
                {items.length > 1 && (
                    <Button
                        type="button"
                        variant="ghost" 
                        size="icon"
                        className="absolute right-2 top-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveItem(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>Nome do Prato</Label>
                        <Input
                        value={item.name}
                        onChange={(e) => handleItemChange(index, "name", e.target.value)}
                        placeholder="Ex: Picanha, Sushi de Salmão..."
                        required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição (Opcional)</Label>
                        <Textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="Ingredientes, detalhes..."
                        rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Imagem</Label>
                        {item.image_url ? (
                        <div className="relative h-40 w-full rounded-lg border overflow-hidden bg-white">
                            <Image
                            src={item.image_url}
                            alt="Preview"
                            fill
                            className="object-cover"
                            />
                            <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() => handleItemChange(index, "image_url", "")}
                            >
                            <X className="h-3 w-3" />
                            </Button>
                        </div>
                        ) : (
                        <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white hover:bg-slate-50 relative">
                            <div className="flex flex-col items-center justify-center pt-2">
                            {uploadingIndex === index ? (
                                <span className="text-sm text-muted-foreground">Carregando...</span>
                            ) : analyzingIndex === index ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <Wand2 className="mb-1 h-6 w-6 text-purple-500" />
                                    <p className="text-xs text-purple-500">Analisando com IA...</p>
                                </div>
                            ) : (
                                <>
                                    <Camera className="mb-1 h-6 w-6 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Adicionar foto</p>
                                </>
                            )}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(index, e)}
                                disabled={uploadingIndex !== null || analyzingIndex !== null}
                            />
                        </label>
                        )}
                    </div>
                </div>
            </div>
        ))}

        <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={handleAddItem}
        >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Outro Item
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || uploadingIndex !== null} className="bg-orange-600 hover:bg-orange-700 text-white">
          {isLoading ? "Salvando..." : "Salvar Todos"}
        </Button>
      </div>
    </form>
  )
}
