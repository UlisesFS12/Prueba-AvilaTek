import { UserI, UserTC } from "./User_model.js";
import bcrypt from "bcrypt";
import { ObjectTypeComposerFieldConfigAsObjectDefinition } from "graphql-compose";
import { schemaComposer, InputTypeComposer } from "graphql-compose";
import jwt from "jsonwebtoken";

const SingUpInput: InputTypeComposer = schemaComposer.createInputTC({
  name: "SingUpInput",
  fields: {
    First_name: "String",
    Last_name: "String",
    email: "String",
    password: "String",
  },
});

const SingInInput: InputTypeComposer = schemaComposer.createInputTC({
  name: "SingInInput",
  fields: {
    email: "String",
    password: "String",
  },
});

interface SingInInput {
  email: string;
  password: string;
}

interface SingUpInput {
  First_name: string;
  Last_name: string;
  email: string;
  password: string;
}

interface SearchUserInput {
  email: string;
}

interface SingOutInput {
  email: string;
  status: string;
}

export const SingUp: ObjectTypeComposerFieldConfigAsObjectDefinition<
  any,
  any,
  any
> = {
  type: "String",
  args: {
    record: "SingUpInput",
  },
  resolve: async (source: any, args: any, context: any) => {
    const { First_name, Last_name, email, password } = args.record;

    const userCorreo = await UserTC.mongooseResolvers.findOne().resolve({
      args: { filter: { email } },
    });

    if (userCorreo) {
      return "Correo ya utilizado";
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userResolver = await UserTC.mongooseResolvers.createOne();
    const user = userResolver
      ? await userResolver.resolve({
          args: {
            record: {
              First_name,
              Last_name,
              email,
              password: hashedPassword,
              active: true,
            },
          },
        })
      : null;

    if (user) {
      return "Usuario creado existosamente";
    } else {
      return "Error al crear el usuario";
    }
  },
};

export const signIn = schemaComposer.createResolver({
  name: "signIn",
  kind: "mutation",
  type: "String", // Replace with your actual User type
  args: {
    email: "String!",
    password: "String!",
  },
  resolve: async ({ args, context }) => {
    if (context.setHeaders.length == 0) {
      const { email, password } = args;
      const { setCookies, setHeaders } = context;
      const user = (await UserTC.mongooseResolvers.findOne().resolve({
        args: { filter: { email } },
      })) as UserI;
      if (!user) {
        throw new Error("Invalid username or password");
      }
      if (typeof password !== "string" || typeof user.password !== "string") {
        throw new Error("Tipo de contraseña invalida");
      } else {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
          const secretKey = "12345";
          const token = jwt.sign({ _id: user._id }, secretKey);
          context.setHeaders.push({ key: "userToken", value: token });
          context.shareData = context;
          return token;
        } else {
          return "Ingrese un email o contraseña valida";
        }
      }
    } else {
      return "Ya hay una sesion iniciada";
    }
  },
});

export const singOut = schemaComposer.createResolver({
  name: "SingOut",
  kind: "mutation",
  description: "Sings out a user",
  type: "String",
  args: {},
  resolve: ({ context }) => {
    if (context.setHeaders.length == 0) {
      return "No hay sesion para ser cerrada";
    } else {
      context.setHeaders.pop();
      context.shareData = context;
      return "Sesion cerrada exitosamente";
    }
  },
});

export const currentUser = schemaComposer.createResolver({
  name: "currentUser",
  kind: "query",
  type: "User", // Replace with your actual User type
  args: {},
  resolve: async ({ context }) => {
    const userTokenHeader = context.setHeaders.find(
      (header: { key: string }) => header.key === "userToken"
    );

    if (typeof userTokenHeader === "undefined") {
      throw new Error("No hay sesion iniciada");
    }

    const token = userTokenHeader.value;

    if (!token) {
      throw new Error("No user singed in");
    }

    try {
      const secretKey = "12345";
      const user = jwt.verify(token, secretKey) as jwt.JwtPayload;
      const existingUserResolver = await UserTC.mongooseResolvers.findOne();
      const existingUser = existingUserResolver
        ? await existingUserResolver.resolve({
            args: { filter: { _id: user._id } },
          })
        : null;

      if (!existingUser) {
        throw new Error("No user found");
      }

      return existingUser;
    } catch (err) {
      throw new Error("Invalid token");
    }
  },
});
