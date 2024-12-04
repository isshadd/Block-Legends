import { TestBed } from '@angular/core/testing';
import { ColorService } from '@app/services/colors-service/colors.service';

describe('ColorService', () => {
    let service: ColorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ColorService],
        });
        service = TestBed.inject(ColorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should assign the same color for the same socketId', () => {
        const socketId = 'socket1';
        const color1 = service.getColor(socketId);
        const color2 = service.getColor(socketId);
        expect(color1).toBe(color2); // Ensure the same color is returned for the same socketId
    });

    it('should assign different colors for different socketIds', () => {
        const socketId1 = 'socket1';
        const socketId2 = 'socket2';
        const color1 = service.getColor(socketId1);
        const color2 = service.getColor(socketId2);
        expect(color1).not.toBe(color2); // Ensure different socketIds get different colors
    });

    it('should cycle through predefined colors and loop back when exhausted', () => {
        const predefinedColors = ['#006D77', '#4169E1', '#228B22', '#DC143C', '#5D3FD3', '#FFBF00'];
        const socketIds = predefinedColors.map((_, index) => `socket${index + 1}`);
        const assignedColors = socketIds.map((socketId) => service.getColor(socketId));

        expect(assignedColors).toEqual(predefinedColors); // Ensure it assigns all predefined colors

        const additionalSocketId = 'socket7';
        const color = service.getColor(additionalSocketId);
        expect(color).toBe(predefinedColors[0]); // Ensure it loops back to the first color
    });
});
