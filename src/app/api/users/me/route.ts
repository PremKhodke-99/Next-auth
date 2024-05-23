import { connect } from '@/db/dbConfig'
import User from '@/models/userModel'
import { NextRequest, NextResponse } from 'next/server'
import { getDataFromToken } from '@/helpers/getDataFromToken'

connect();

export async function GET(request: NextRequest) {
    //extract data from token
    try {
        const userId = await getDataFromToken(request);
        console.log(userId);
        
        const user = await User.findOne({ _id: userId }).select("-password");
        console.log(user);
        
        //check if no user
        return NextResponse.json({
            message: "User Found",
            data: user
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}