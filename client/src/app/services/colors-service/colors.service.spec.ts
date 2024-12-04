import { TestBed } from '@angular/core/testing';
import { ColorService } from './colors.service';

describe('ColorService', () => {
    let service: ColorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ColorService]
        });
        service = TestBed.inject(ColorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getColor', () => {
        it('should assign a color to a new socket ID', () => {
            const socketId = 'test-socket-1';
            const color = service.getColor(socketId);
            expect(color).toBe('#006D77'); // First color in the array
        });

        it('should return the same color for the same socket ID', () => {
            const socketId = 'test-socket-2';
            const firstCall = service.getColor(socketId);
            const secondCall = service.getColor(socketId);
            expect(firstCall).toBe(secondCall);
        });

        it('should cycle through colors for different socket IDs', () => {
            const colors = ['#006D77', '#4169E1', '#228B22', '#DC143C', '#5D3FD3', '#FFBF00'];
            
            // Test first cycle of colors
            for (let i = 0; i < colors.length; i++) {
                const socketId = `test-socket-${i}`;
                const color = service.getColor(socketId);
                expect(color).toBe(colors[i]);
            }
        });

        it('should wrap around to first color after all colors are used', () => {
            const colors = ['#006D77', '#4169E1', '#228B22', '#DC143C', '#5D3FD3', '#FFBF00'];
            
            // Assign all colors first
            for (let i = 0; i < colors.length; i++) {
                service.getColor(`test-socket-${i}`);
            }

            // Next socket should get first color again
            const newSocketId = 'test-socket-next';
            const color = service.getColor(newSocketId);
            expect(color).toBe(colors[0]);
        });

        it('should maintain different colors for different sockets', () => {
            const socket1 = 'test-socket-1';
            const socket2 = 'test-socket-2';

            const color1 = service.getColor(socket1);
            const color2 = service.getColor(socket2);

            expect(color1).not.toBe(color2);
        });
    });
});