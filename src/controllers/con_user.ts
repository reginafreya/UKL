import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL,SECRET } from "../global";
import md5  from "md5";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAlluser = async (request: Request, response: Response) => {
  try {
    const { search } = request.query;
    const allUser = await prisma.user.findMany({
      where: { username: { contains: search?.toString() || "" } },
    });

    return response
      .json({
        status: true,
        data: allUser,
        message: `User has retrieved`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400);
  }
};

export const createUser = async (request: Request, response: Response) => {
  try {
    const { username, password, role } = request.body;
    const uuid = uuidv4();

    const existingUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return response.status(400).json({
        status: false,
        message: "Username sudah di pakai",
      });
    }

    // Membuat pengguna baru jika username belum digunakan
    const newUser = await prisma.user.create({
      data: { uuid, username, password: md5(password), role },
    });

    return response.status(200).json({
      status: true,
      data: newUser,
      message: `New User has been created`,
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${(error as Error).message}`,
    });
  }
};


export const updateUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { username, password, } = request.body;

    const findUser = await prisma.user.findFirst({
      where: { id: Number(id) },
    });
    if (!findUser)
      return response
        .status(200)
        .json({ status: false, message:`User is not found` });

    const updateUser = await prisma.user.update({
      data: {
        username: username || findUser.username,
        password:md5(password) || findUser.password,
      },
      where: { id: Number(id) },
    });
  
    return response
      .json({
        status: true,
        data: updateUser,
        message: `User has updated`
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400);
  }
};

export const deleteUser = async(request:Request, response:Response) =>{
    try {
        const {id} = request.params
        const findUser = await prisma.user.findFirst({where: {id: Number(id)}})
        if (!findUser)return response 
        .status(200).json({ status: false, massage:`User with id ${id} not found`})
    
        const result = await prisma.user.delete({
            where:{ id: Number(request.params.id)}
        })
        return response.json({
            status: true,
            data: result,
            massage: `User with id ${id} has been Deleted`
        }).status(200)

    } catch (error) {
        return response.json({
        status: false,
        massage:`There is an error. ${error}`
        })
        .status(400)
    }
}


export const authentification = async(request:Request,response:Response) =>{
    try {
        const {username, password} =request.body

        const findUser = await prisma.user.findFirst({
            where: { username,password: md5(password) }
        })
        
        if(!findUser)
        return response
            .status(200)
            .json({
             status: false,
             logged: false,
             message: `username or password is invalid`
            });

            let data={
                id:findUser.id,
                username:findUser.username,
                role:findUser.role,
            }

            let payload=JSON.stringify(data)

            let token=sign(payload, SECRET || "token")

            return response
            .status(200)
            .json({status:true, logged: true, message:`Login Success`, token})
            
    } catch (error) {
        return response.json({
            status: false,
            massage:`There is an error. ${error}`
            })
            .status(400)
    }
}