import * as Jwt from "jsonwebtoken";

console.log("JWT_SECRET:", process.env.JWT_SECRET);

export const createToken = ( id: number, role: string ) => {
    return Jwt.sign({
        id,
        role
    }, process.env.JWT_SECRET as string,{
        expiresIn: "7d"
    }
)
}

export const createAccessToken = (
  id: number,
  role: string
) => {
  return Jwt.sign(
    { id, role },
    process.env.JWT_SECRET!,
    {
      expiresIn: "15m",
    }
  )
}