// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'

type MinsterArragement = {
    _id: string
    riqi: string,
    dailing: string,
    sishi: string,
    siqing: string,
    siku: string
}

type Data = MinsterArragement[]

const omit_id = (arrangement: MinsterArragement) => {
    delete arrangement._id
    return arrangement
}

async function getArrangements(req: NextApiRequest, res: NextApiResponse<Data>, mongodbClient: MongoClient) {
    const { startDate, endDate } = req.query
    if (!startDate || !endDate) {
        return res.status(400).end()
    }
    const database = mongodbClient.db('worship')
    const arrangements = database.collection('serving_staff_arrangements')
    let result = await arrangements.find({ riqi: {$gte: startDate, $lte: endDate}}, { sort: { riqi: 1 } }).toArray()
    result = result.map(omit_id)
    res.status(200).json(result)
}

async function setArrangements(req: NextApiRequest, res: NextApiResponse, mongodbClient: MongoClient) {
    const database = mongodbClient.db('worship')
    const arrangements = database.collection('serving_staff_arrangements')
    const promises = req.body.map(arrangement => ({...arrangement, _id:arrangement.riqi}))
        .map(arrangement => arrangements.findOneAndReplace({"riqi": arrangement.riqi}, arrangement, {upsert: true}))
    try {
        await Promise.all(promises)
        res.status(200).end()
    } catch (err) {
        console.log("update arrangements failure", err)
        res.status(500).end()
    }
}

const MongodbConnect = async (callback, req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL, 
        { useNewUrlParser: true, useUnifiedTopology: true })
    try {
        await client.connect()
        await callback(req, res, client)
    } catch (err) {
        console.log("monogo db connect error", err)
        res.status(500).end()
    } finally {
        client.close()
    }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const { method } = req;
    switch (method) {
        case 'GET':
            return await MongodbConnect(getArrangements, req, res)
        case 'POST':
            return await MongodbConnect(setArrangements, req, res)
        default:
            res.setHeader('Allow', ['GET', 'PUT'])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}