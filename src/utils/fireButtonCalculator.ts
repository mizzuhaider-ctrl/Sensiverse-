import { GameId, PhoneModel, GripStyle, FireButtonConfig } from '../types';
import { 
  generateFireButtonConfig, 
  calculatePhysicalRunwayMm, 
  FIRE_BUTTON_MIN, 
  FIRE_BUTTON_MAX, 
  clampFireButtonSize 
} from './sensitivityEngine';

export { 
  generateFireButtonConfig, 
  calculatePhysicalRunwayMm, 
  FIRE_BUTTON_MIN, 
  FIRE_BUTTON_MAX, 
  clampFireButtonSize 
};

/**
 * Calculates recommended fire button geometry taking into account:
 * - Usable screen width and aspect ratio
 * - Player grip style (2-finger thumb vs 3/4-finger claw)
 * - Game HUD limits
 */
export function calculateFireButton(
  gameId: GameId,
  phone: PhoneModel,
  grip: GripStyle
): FireButtonConfig {
  return generateFireButtonConfig(gameId, phone, grip);
}
