import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowRight, Camera } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Produto } from "@/lib/api"
import { useLocalizacao, useProdutos } from "@/hooks/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import BarCodeReader from "@/components/app/BarCodeReader"

const produtoSearchSchema = z.object({
  search: z.string().optional(),
})

export const Route = createFileRoute("/_auth/consultas/produtos")({
  validateSearch: produtoSearchSchema.parse,
  loaderDeps: ({ search: { search } }) => ({ search }),
  loader: ({
    context: {
      queryClient,
      auth: { token },
    },
    deps: { search },
  }) =>
    queryClient.ensureQueryData(
      useProdutos.queryOptions(token, search, !!search)
    ),
  component: Page,
})

const formSchema = z.object({ search: z.string() })
type FormSchema = z.infer<typeof formSchema>

function Page() {
  const navigate = Route.useNavigate()
  const { search } = Route.useSearch()
  const form = useForm<FormSchema>({
    defaultValues: {
      search,
    },
  })
  const [open, setOpen] = useState(false)
  const { data: produtos, error } = useProdutos(search, !!search) // Adiciona tratamento de erro

  function onSubmit(values: FormSchema) {
    navigate({
      search: {
        search: values.search,
      },
    })
  }

  return (
    <Card className="m-2">
      <CardHeader>
        <CardTitle className="text-lg">Busca de Produtos</CardTitle>
        <Form {...form}>
          <form
            className="flex w-full flex-row items-center gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="relative flex flex-row items-center gap-2">
                      <Drawer
                        open={open}
                        onOpenChange={(open) => setOpen(open)}
                      >
                        <DrawerTitle className="sr-only">
                          Leia o código de barras
                        </DrawerTitle>
                        <DrawerTrigger asChild>
                          <Button
                            className="absolute"
                            variant="ghost"
                            size="icon"
                          >
                            <Camera className="text-muted-foreground" />
                            <span className="sr-only">Abrir Câmera</span>
                          </Button>
                        </DrawerTrigger>
                        <Input
                          className="pl-10"
                          type="search"
                          placeholder="Código Interno ou Código de Barras"
                          {...field}
                        />
                        <DrawerContent className="gap-2 px-2 pb-2">
                          <BarCodeReader
                            onBarcodeReaded={(barcodeReaded) => {
                              form.setValue("search", barcodeReaded)
                              onSubmit({
                                search: barcodeReaded,
                              })
                              setOpen(false)
                            }}
                          />
                        </DrawerContent>
                      </Drawer>
                      <Button disabled={form.formState.isLoading} type="submit">
                        <ArrowRight />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {produtos?.length ? (
          produtos.map((produto) => (
            <ProdutoCard key={produto.id} produto={produto} />
          ))
        ) : (
          <div>Nenhum produto encontrado.</div>
        )}
      </CardContent>
    </Card>
  )
}

function ProdutoCard({ produto }: { produto: Produto }) {
  const localizacao = useLocalizacao(produto.id)
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false)
  const [formData, setFormData] = useState({
    bandeja: localizacao.data?.bandeja || "",
    rua: localizacao.data?.rua || "",
    prateleira: localizacao.data?.prateleira || "",
    posicao: localizacao.data?.posicao || "",
    deposito: localizacao.data?.deposito || "",
  })

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/produtos/${produto.id}/localizacao`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 123",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar a localização")
      }

      alert("Localização atualizada com sucesso!")
      setIsLocationDrawerOpen(false)
    } catch (error) {
      console.error("Erro:", error)
      alert("Falha ao atualizar a localização.")
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            {produto.description}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Detalhes</div>
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Código Interno</span>
              <span>{produto.id}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Saldo</span>
              <span>{produto.saldo}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Localização</span>
              <span>{`${localizacao.data?.bandeja || "N/A"}, ${localizacao.data?.rua || "N/A"}, ${localizacao.data?.prateleira || "N/A"}, ${localizacao.data?.posicao || "N/A"}, ${localizacao.data?.deposito || "N/A"}`}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Marca</span>
              <span>{produto.marca}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Ref. Fábrica</span>
              <span>{produto.referencia_fabrica}</span>
            </li>
          </ul>
          {/* Botão para alterar localização */}
          <Button onClick={() => setIsLocationDrawerOpen(true)}>
            Alterar Localização
          </Button>
        </div>
      </CardContent>
      {/* Alteração de localização */}
      <Drawer
        open={isLocationDrawerOpen}
        onOpenChange={setIsLocationDrawerOpen}
      >
        <DrawerContent>
          <div className="mb-6" style={{ textAlign: "center" }}>
            <DrawerTitle> Alterar Localização </DrawerTitle>
          </div>
          {/* Formulário de alteração de localização */}
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3">
              <Input
                name="bandeja"
                placeholder=" Nova Bandeja"
                value={formData.bandeja}
                onChange={handleLocationChange}
              />
              <Input
                name="rua"
                placeholder=" Nova Rua"
                value={formData.rua}
                onChange={handleLocationChange}
              />
              <Input
                name="prateleira"
                placeholder=" Nova Prateleira"
                value={formData.prateleira}
                onChange={handleLocationChange}
              />
              <Input
                name="posicao"
                placeholder=" Nova Posição"
                value={formData.posicao}
                onChange={handleLocationChange}
              />
              <Input
                name="deposito"
                placeholder="Novo Depósito"
                value={formData.deposito}
                onChange={handleLocationChange}
              />
              <Button className="mt-6" type="submit">
                Atualizar
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </Card>
  )
}
