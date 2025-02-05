import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import Usuario from "../../src/usuarios/domain/Usuario";
import Admin from "../../src/usuarios-admin/domain/Admin";
const SECRET_KEY: Secret = "miclave";

const decode = (token: string) => {
  return jwt.decode(token);
};

const createToken = (user: Usuario | Admin): string => {

	if('tienda_alias' in user){
		const payload = {
			alias: user.alias,
			correo: user.correo,
			tienda_id: user.tienda_id,
			tienda_alias: user.tienda_alias,
		};
		return jwt.sign(payload, SECRET_KEY, { expiresIn: "1 days" });
	}else{
		const payload = {
			alias: user.alias,
			correo: user.correo,
		};
		return jwt.sign(payload, SECRET_KEY, { expiresIn: "1 days" });
	}

  
};

const isAuth = (req: Request, response: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token: string | undefined = authHeader && authHeader.split(" ")[1];
    if (token) {
      const decoded: any = jwt.verify(token, SECRET_KEY);
      req.body.alias = decoded.alias;
      req.body.correo = decoded.correo;
      next();
    } else {
      response.status(401).json({ mensaje: "No autorizado" });
    }
  } catch (err) {
    console.error(err);
    response.status(401).json({ mensaje: "No autorizado" });
  }
};

const isAdmin = (req: Request, response: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];
        const token: string | undefined = authHeader && authHeader.split(" ")[1];
        if (token) {
          const decoded: any = jwt.verify(token, SECRET_KEY);
          req.body.alias = decoded.alias;
          req.body.correo = decoded.correo;
		  if(decoded.tienda_alias && decoded.tienda_id){
			req.body.tienda_id = decoded.tienda_id;
			req.body.tienda_alias = decoded.tienda_alias;
			next();
		  }else {
			response.status(401).json({ mensaje: "No autorizado" });
		  }
         
        } else {
          response.status(401).json({ mensaje: "No autorizado" });
        }
	} catch (err) {
		console.error(err);
		response.status(401).json({ mensaje: "No autorizado" });
	}
} 

const rejectAdmin = (req: Request, response: Response, next: NextFunction) => {
	try {
	  const authHeader = req.headers["authorization"];
		const token: string | undefined = authHeader && authHeader.split(" ")[1];
		if (token) {
		  const decoded: any = jwt.verify(token, SECRET_KEY);
		  req.body.alias = decoded.alias;
		  req.body.correo = decoded.correo;
		  if(decoded.tienda_alias && decoded.tienda_id){
			response.status(401).json({ mensaje: "No autorizado,admins no tienen acceso a cesta" });
		  }else {
			next();
		  }
		 
		} else {
		  response.status(401).json({ mensaje: "No autorizado" });
		}
	} catch (err) {
		console.error(err);
		response.status(401).json({ mensaje: "No autorizado" });
	}
}

export { decode, createToken, isAuth,isAdmin,rejectAdmin };