import * as Jwt from "jsonwebtoken";

export const createToken = ( id: number, role: string ) => {
    return Jwt.sign({
        id,
        role
    }, process.env.JWT_SECRET as string,{
        expiresIn: "1d"
    }
)
}