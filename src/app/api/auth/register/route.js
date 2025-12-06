import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getCurrentUser } from "@/lib/auth-server";

export async function POST(req) {
    
    
 try {
    const currentUser = await getCurrentUser();
    // if user is already logged in, prevent registeration
     if (currentUser) {
        return NextResponse.json({error: 'User is already logged in'}, {status: 400});
    }

    const body = await req.json();

    // destructure required field from req body
    const {email, password} = body;


    // check for missing fields || fields that were'nt inputted and return error if true
    if (!email || !password) {
        return NextResponse.json({message: 'Missing required field'}, {status: 400})
    }


    // convert inputted email into lower case
    const emailToLower = String(email).trim().toLowerCase();

    // check on password to make sure password must at leaste be Password must be 8+ chars, include uppercase, lowercase, number and special char
    const strongPasswordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!strongPasswordCheck.test(password)){
        return NextResponse.json({message: 'Password must be 8+ chars, include uppercase, lowercase, number and special char'}, {status: 400})
    }

    // check if user already exists in DB using prisma
    const existingUser = await prisma.user.findUnique(
        {
            where: {email: emailToLower},
            select: {id:true}
        }
    );

    // if user exists return error
    if (existingUser){
        return NextResponse.json({message: 'User already exists'}, {status: 409})
    }

    // hash/secure passwword by turning typed in password into jargons in db
    const hashedPassword = await hashPassword(password)

    // create user in db if existing user check becomes false
    const user = await prisma.user.create(
       {
        data: {email: emailToLower, passwordHash: hashedPassword},
        select: { id: true, email: true} 
       }
    )


    // note: {select: { id: true, name: true, email: true} } over return NextResponse.json({ id: user.id, email: user.email }) as the former only returns selected fields while the latter retur

    return NextResponse.json({ok: true, message: 'User created successfully', user}, {status: 201});
 } catch (error) {
    console.error('error occured', error);
    return NextResponse.json({error: `Error occured ${error}` }, {status: 500});
 }
}