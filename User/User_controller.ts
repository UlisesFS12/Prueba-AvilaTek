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
    /*const existingUserResolver = await UserTC.mongooseResolvers.findOne();
    const existingUser = existingUserResolver
      ? await existingUserResolver.resolve({ email })
      : null;
    if (existingUser.email == email) {
      return existingUser;
    }*/

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

/*export const SingIn: ObjectTypeComposerFieldConfigAsObjectDefinition<
  any,
  any,
  any
> = {
  type: "String",
  args: {
    record: "SingInInput",
  },
  resolve: async (source: any, args: any, context: any) => {
    const { email, password } = args.record;
    const userResolver = await UserTC.mongooseResolvers.findOne();
    const user = userResolver
      ? await userResolver.resolve({ args: { filter: { email } } })
      : null;
    if (user && user.email === email && user.status === "no activo") {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (user.password === password) {
        const updateResolver = await UserTC.mongooseResolvers.updateOne();
        const updatedUser = updateResolver
          ? await updateResolver.resolve({
              args: {
                filter: { email },
                record: { status: "iniciado" },
              },
            })
          : null;
        return updatedUser
          ? "Se ha iniciado sesion correctamente"
          : "Error actualizando el usuario";
      } else {
        return "Incorrect password";
      }
    } else {
      return "Usuario no encontrado o ya ha iniciado sesion";
    }
  },
};*/

/*export const SingIn: ObjectTypeComposerFieldConfigAsObjectDefinition<
  any,
  any,
  any
> = {
  type: "String",
  args: {
    record: "SingInInput",
  },
  resolve: async (source: any, args: any, context: any) => {
    const { email, password } = args.record;
    const { req, res } = context; // Destructure res from context
    // Authenticate the user...
    // If authentication is successful, generate a token:
    const user = { email: email, password: password }; // replace 'user_id' with actual user id
    const secretKey = "12345"; // replace with your actual secret key
    const token = jwt.sign(user, secretKey, {});

    // Set the token as a cookie:
    res.cookie("userToken", token, { httpOnly: true });

    return token;
  },
};*/

// how can i verify a jwt in my express server

/*export async function SingOut({ email }: SingOutInput): Promise<String> {
  const existingUserResolver = await UserTC.mongooseResolvers.findOne();
  const existingUser = existingUserResolver
    ? await existingUserResolver.resolve({ email })
    : null;

  if (existingUser.status == "iniciado") {
    existingUser.status = "no iniciado";
    return "Se ha salido exitosamente de la sesion";
  } else {
    return "El usuario tiene que estar iniciado para poder salir de la sesion";
  }
}*/

/*``
export async function checkActiveUsers() {
  const activeUsers = await UserTC.mongooseResolvers.findMany({});
  if (activeUsers) {
    return true;
  } else {
    return false;
  }
}

export async function SingIn({ email, password }: SingInInput) {
  const status = await checkActiveUsers();
  const user = await SearchUser(email, password);
  if (user == null) {
    return null;
  } else {
    if (status == false) {
      user.active = true;
      await user.save();
      return user;
    } else {
      ("Ya hay otro usuario iniciado");
    }
  }
}

export async function findOne(id: string, active: boolean) {
  const user = await UserTC.findOne({ _id: id, active: active });
  return user;
}
*/
