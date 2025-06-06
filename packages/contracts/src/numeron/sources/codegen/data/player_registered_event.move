  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module numeron::numeron_player_registered_event {

  use sui::event;

  use std::ascii::String;

  use numeron::numeron_monster_type::MonsterType;

  use numeron::numeron_monster_ball_type::MonsterBallType;

  use numeron::numeron_monster_catch_result::MonsterCatchResult;

  use numeron::numeron_map_config::MapConfig;

  use numeron::numeron_position::Position;

  use numeron::numeron_encounter_info::EncounterInfo;

  use numeron::numeron_stats::Stats;

  use numeron::numeron_monster_info::MonsterInfo;

  use numeron::numeron_item_type::ItemType;

  use numeron::numeron_item_metadata::ItemMetadata;

  use numeron::numeron_item::Item;

  use numeron::numeron_item_drop::ItemDrop;

  use numeron::numeron_craft_path::CraftPath;

  use numeron::numeron_swap_order::SwapOrder;

  use numeron::numeron_trade_order::TradeOrder;

  public struct PlayerRegisteredEvent has copy, drop {
    player: address,
    position: Position,
  }

  public fun new(player: address, position: Position): PlayerRegisteredEvent {
    PlayerRegisteredEvent {
                                   player,position
                               }
  }
}
