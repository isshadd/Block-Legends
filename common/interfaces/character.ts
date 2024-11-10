import { Avatar } from '../../common/enums/avatar-enum';
import { Attributes } from '../classes/attributes';

export interface Character {
    avatar: Avatar;
    name: string;
    socketId: string;
    attributes: Attributes;
}
