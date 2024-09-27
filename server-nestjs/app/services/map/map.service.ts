import { Map, MapDocument } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/map.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MapService {
    constructor(@InjectModel(Map.name) private mapModel: Model<MapDocument>) {}

    async addMap(map: CreateMapDto): Promise<void> {
        try {
            await this.mapModel.create(map);
        } catch (error) {
            throw Promise.reject(`Failed to insert map: ${error}`);
        }
    }

    async getAllMaps(): Promise<Map[]> {
        return await this.mapModel.find({});
    }

    async getMap(id: string): Promise<Map> {
        return await this.mapModel.findOne({ _id: id });
    }

    async modifyMap(id: string, map: CreateMapDto): Promise<void> {
        const filterQuery = { _id: id };
        try {
            const res = await this.mapModel.updateOne(filterQuery, map);
            if (res.matchedCount === 0) {
                throw new Error('Could not find map');
            }
        } catch (error) {
            throw new Error(`Failed to update document: ${error}`);
        }
    }
}
