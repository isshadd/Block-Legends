// src/app/services/item-factory.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { Chestplate } from '@common/classes/Items/chestplate';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { Elytra } from '@common/classes/Items/elytra';
import { EnchantedBook } from '@common/classes/Items/enchanted-book';
import { Flag } from '@common/classes/Items/flag';
import { Item } from '@common/classes/Items/item';
import { Potion } from '@common/classes/Items/potion';
import { RandomItem } from '@common/classes/Items/random-item';
import { Spawn } from '@common/classes/Items/spawn';
import { Totem } from '@common/classes/Items/totem';
import { ItemType } from '@common/enums/item-type';
import { ItemFactoryService } from './item-factory.service';

describe('ItemFactoryService', () => {
    let service: ItemFactoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ItemFactoryService],
        });
        service = TestBed.inject(ItemFactoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createItem', () => {
        it('should create a DiamondSword when ItemType.Sword is passed', () => {
            const item = service.createItem(ItemType.Sword);
            expect(item).toBeInstanceOf(DiamondSword);
            expect(item.type).toBe(ItemType.Sword);
        });

        it('should create an Elytra when ItemType.Elytra is passed', () => {
            const item = service.createItem(ItemType.Elytra);
            expect(item).toBeInstanceOf(Elytra);
            expect(item.type).toBe(ItemType.Elytra);
        });

        it('should create a Totem when ItemType.Totem is passed', () => {
            const item = service.createItem(ItemType.Totem);
            expect(item).toBeInstanceOf(Totem);
            expect(item.type).toBe(ItemType.Totem);
        });

        it('should create a Potion when ItemType.Potion is passed', () => {
            const item = service.createItem(ItemType.MagicShield);
            expect(item).toBeInstanceOf(Potion);
            expect(item.type).toBe(ItemType.MagicShield);
        });

        it('should create an EnchantedBook when ItemType.EnchantedBook is passed', () => {
            const item = service.createItem(ItemType.EnchantedBook);
            expect(item).toBeInstanceOf(EnchantedBook);
            expect(item.type).toBe(ItemType.EnchantedBook);
        });

        it('should create a Chestplate when ItemType.Chestplate is passed', () => {
            const item = service.createItem(ItemType.Chestplate);
            expect(item).toBeInstanceOf(Chestplate);
            expect(item.type).toBe(ItemType.Chestplate);
        });

        it('should create a Flag when ItemType.Flag is passed', () => {
            const item = service.createItem(ItemType.Flag);
            expect(item).toBeInstanceOf(Flag);
            expect(item.type).toBe(ItemType.Flag);
        });

        it('should create a Spawn when ItemType.Spawn is passed', () => {
            const item = service.createItem(ItemType.Spawn);
            expect(item).toBeInstanceOf(Spawn);
            expect(item.type).toBe(ItemType.Spawn);
        });

        it('should create a RandomItem when ItemType.Random is passed', () => {
            const item = service.createItem(ItemType.Random);
            expect(item).toBeInstanceOf(RandomItem);
            expect(item.type).toBe(ItemType.Random);
        });

        it('should create a generic Item when an unknown ItemType is passed', () => {
            const unknownType = 'UnknownType' as ItemType;
            const item = service.createItem(unknownType);
            expect(item).toBeInstanceOf(Item);
            expect(item.type).toBeUndefined();
        });
    });

    describe('copyItem', () => {
        it('should create a new item of the same type', () => {
            const originalItem = service.createItem(ItemType.Sword);
            originalItem.setCoordinates({ x: 10, y: 20 }); // Assuming setCoordinates is defined
            originalItem.itemLimit = 5; // Assuming itemLimit is a property
            const copiedItem = service.copyItem(originalItem);

            expect(copiedItem).toBeInstanceOf(DiamondSword);
            expect(copiedItem.type).toBe(originalItem.type);
        });

        it('should return a different instance when copying an item', () => {
            const originalItem = service.createItem(ItemType.Elytra);
            const copiedItem = service.copyItem(originalItem);

            expect(copiedItem).not.toBe(originalItem);
        });

        it('should copy coordinates and itemLimit correctly', () => {
            const originalItem = service.createItem(ItemType.MagicShield);
            originalItem.setCoordinates({ x: 5, y: 15 });
            originalItem.itemLimit = 3;
            const copiedItem = service.copyItem(originalItem);

            expect(copiedItem.coordinates).toEqual(originalItem.coordinates);
            expect(copiedItem.itemLimit).toBe(originalItem.itemLimit);
        });

        it('should handle copying a generic Item', () => {
            const originalItem = service.createItem('Generic' as ItemType);
            originalItem.setCoordinates({ x: 0, y: 0 });
            originalItem.itemLimit = 1;
            const copiedItem = service.copyItem(originalItem);

            expect(copiedItem).toBeInstanceOf(Item);
            expect(copiedItem.type).toBe(originalItem.type);
            expect(copiedItem).not.toBe(originalItem);
            expect(copiedItem.coordinates).toEqual(originalItem.coordinates);
            expect(copiedItem.itemLimit).toBe(originalItem.itemLimit);
        });
    });
});
