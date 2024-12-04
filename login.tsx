import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { IMaskMixin } from "react-imask"
import { z } from "zod"

import { validCNPJ } from "@/lib/utils"
import { useLogin } from "@/hooks/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const MaskedInput = IMaskMixin(({ inputRef, ...props }) => (
  <Input {...props} ref={inputRef} />
))

const formSchema = z
  .object({
    cnpj: z.string().refine(validCNPJ, {
      message: "CNPJ Inválido",
    }),
    username: z.string(),
    password: z.string(),
  })
  .required()

type Schema = z.infer<typeof formSchema>

export default function Login() {
  const login = useLogin()

  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit({ cnpj, username, password }: Schema) {
    login.mutate({ cnpj: cnpj.trim(), username: username.trim(), password })
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      {" "}
      {/* Contêiner de centralização */}
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre o seu usuário abaixo para se autenticar
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <MaskedInput mask="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel htmlFor="username">Usuário</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="username"
                        autoComplete="username"
                        placeholder="Insira o usuário"
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Senha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                        placeholder="Sua senha..."
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={login.status === "pending"}
                type="submit"
              >
                {login.status === "pending" ? "Carregando..." : "Entrar"}
              </Button>
              {login.status == "error" && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Falha no login!</AlertTitle>
                  <AlertDescription>{login.error.api_message}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Form>
        </form>
      </Card>
    </div>
  )
}
