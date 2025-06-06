  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module dubhe::dubhe_events {

  use std::ascii::{String, string};

  use dubhe::dubhe_account_status::AccountStatus;

  use dubhe::dubhe_asset_status::AssetStatus;

  use dubhe::dubhe_asset_type::AssetType;

  use dubhe::dubhe_account::Account;

  use dubhe::dubhe_asset_metadata::AssetMetadata;

  use dubhe::dubhe_pool::Pool;

  use dubhe::dubhe_bridge_config::BridgeConfig;

  use dubhe::dubhe_dapp_metadata::DappMetadata;

  use dubhe::dubhe_dapp_stats::DappStats;

  use dubhe::dubhe_asset_created_event::AssetCreatedEvent;

  use dubhe::dubhe_asset_created_event;

  public fun asset_created_event(
    asset_id: u256,
    name: String,
    symbol: String,
    owner: address,
    is_mintable: bool,
    is_burnable: bool,
    is_freezable: bool,
  ) {
    dubhe::storage_event::emit_set_record<AssetCreatedEvent, AssetCreatedEvent, AssetCreatedEvent>(
				string(b"asset_created_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_asset_created_event::new(asset_id,name,symbol,owner,is_mintable,is_burnable,is_freezable))
			  )
  }

  use dubhe::dubhe_asset_transferred_event::AssetTransferredEvent;

  use dubhe::dubhe_asset_transferred_event;

  public fun asset_transferred_event(asset_id: u256, from: address, to: address, amount: u256) {
    dubhe::storage_event::emit_set_record<AssetTransferredEvent, AssetTransferredEvent, AssetTransferredEvent>(
				string(b"asset_transferred_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_asset_transferred_event::new(asset_id,from,to,amount))
			  )
  }

  use dubhe::dubhe_ownership_transferred_event::OwnershipTransferredEvent;

  use dubhe::dubhe_ownership_transferred_event;

  public fun ownership_transferred_event(asset_id: u256, from: address, to: address) {
    dubhe::storage_event::emit_set_record<OwnershipTransferredEvent, OwnershipTransferredEvent, OwnershipTransferredEvent>(
				string(b"ownership_transferred_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_ownership_transferred_event::new(asset_id,from,to))
			  )
  }

  use dubhe::dubhe_pool_created_event::PoolCreatedEvent;

  use dubhe::dubhe_pool_created_event;

  public fun pool_created_event(
    creator: address,
    asset1_id: u256,
    asset2_id: u256,
    pool_address: address,
    lp_asset_id: u256,
    lp_asset_symbol: String,
  ) {
    dubhe::storage_event::emit_set_record<PoolCreatedEvent, PoolCreatedEvent, PoolCreatedEvent>(
				string(b"pool_created_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_pool_created_event::new(creator,asset1_id,asset2_id,pool_address,lp_asset_id,lp_asset_symbol))
			  )
  }

  use dubhe::dubhe_liquidity_added_event::LiquidityAddedEvent;

  use dubhe::dubhe_liquidity_added_event;

  public fun liquidity_added_event(
    who: address,
    asset1_id: u256,
    asset2_id: u256,
    asset1_amount: u256,
    asset2_amount: u256,
    lp_asset_id: u256,
    lp_asset_minted: u256,
  ) {
    dubhe::storage_event::emit_set_record<LiquidityAddedEvent, LiquidityAddedEvent, LiquidityAddedEvent>(
				string(b"liquidity_added_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_liquidity_added_event::new(who,asset1_id,asset2_id,asset1_amount,asset2_amount,lp_asset_id,lp_asset_minted))
			  )
  }

  use dubhe::dubhe_liquidity_removed_event::LiquidityRemovedEvent;

  use dubhe::dubhe_liquidity_removed_event;

  public fun liquidity_removed_event(
    who: address,
    asset1_id: u256,
    asset2_id: u256,
    asset1_amount: u256,
    asset2_amount: u256,
    lp_asset_id: u256,
    lp_asset_burned: u256,
  ) {
    dubhe::storage_event::emit_set_record<LiquidityRemovedEvent, LiquidityRemovedEvent, LiquidityRemovedEvent>(
				string(b"liquidity_removed_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_liquidity_removed_event::new(who,asset1_id,asset2_id,asset1_amount,asset2_amount,lp_asset_id,lp_asset_burned))
			  )
  }

  use dubhe::dubhe_lp_minted_event::LpMintedEvent;

  use dubhe::dubhe_lp_minted_event;

  public fun lp_minted_event(sender: address, asset0: u256, asset1: u256, amount0: u256, amount1: u256, to: address) {
    dubhe::storage_event::emit_set_record<LpMintedEvent, LpMintedEvent, LpMintedEvent>(
				string(b"lp_minted_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_lp_minted_event::new(sender,asset0,asset1,amount0,amount1,to))
			  )
  }

  use dubhe::dubhe_lp_burned_event::LpBurnedEvent;

  use dubhe::dubhe_lp_burned_event;

  public fun lp_burned_event(sender: address, asset0: u256, asset1: u256, amount0: u256, amount1: u256, to: address) {
    dubhe::storage_event::emit_set_record<LpBurnedEvent, LpBurnedEvent, LpBurnedEvent>(
				string(b"lp_burned_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_lp_burned_event::new(sender,asset0,asset1,amount0,amount1,to))
			  )
  }

  use dubhe::dubhe_swap_event::SwapEvent;

  use dubhe::dubhe_swap_event;

  public fun swap_event(
    sender: address,
    asset0: u256,
    asset1: u256,
    amount0_in: u256,
    amount1_in: u256,
    amount0_out: u256,
    amount1_out: u256,
    to: address,
  ) {
    dubhe::storage_event::emit_set_record<SwapEvent, SwapEvent, SwapEvent>(
				string(b"swap_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_swap_event::new(sender,asset0,asset1,amount0_in,amount1_in,amount0_out,amount1_out,to))
			  )
  }

  use dubhe::dubhe_asset_wrapped_event::AssetWrappedEvent;

  use dubhe::dubhe_asset_wrapped_event;

  public fun asset_wrapped_event(from: address, asset_id: u256, amount: u256, beneficiary: address) {
    dubhe::storage_event::emit_set_record<AssetWrappedEvent, AssetWrappedEvent, AssetWrappedEvent>(
				string(b"asset_wrapped_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_asset_wrapped_event::new(from,asset_id,amount,beneficiary))
			  )
  }

  use dubhe::dubhe_asset_unwrapped_event::AssetUnwrappedEvent;

  use dubhe::dubhe_asset_unwrapped_event;

  public fun asset_unwrapped_event(from: address, asset_id: u256, amount: u256, beneficiary: address) {
    dubhe::storage_event::emit_set_record<AssetUnwrappedEvent, AssetUnwrappedEvent, AssetUnwrappedEvent>(
				string(b"asset_unwrapped_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_asset_unwrapped_event::new(from,asset_id,amount,beneficiary))
			  )
  }

  use dubhe::dubhe_bridge_withdraw_event::BridgeWithdrawEvent;

  use dubhe::dubhe_bridge_withdraw_event;

  public fun bridge_withdraw_event(
    asset_id: u256,
    from: address,
    to: address,
    to_chain: String,
    amount: u256,
    fee: u256,
  ) {
    dubhe::storage_event::emit_set_record<BridgeWithdrawEvent, BridgeWithdrawEvent, BridgeWithdrawEvent>(
				string(b"bridge_withdraw_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_bridge_withdraw_event::new(asset_id,from,to,to_chain,amount,fee))
			  )
  }

  use dubhe::dubhe_bridge_deposit_event::BridgeDepositEvent;

  use dubhe::dubhe_bridge_deposit_event;

  public fun bridge_deposit_event(asset_id: u256, from: address, to: address, from_chain: String, amount: u256) {
    dubhe::storage_event::emit_set_record<BridgeDepositEvent, BridgeDepositEvent, BridgeDepositEvent>(
				string(b"bridge_deposit_event"),
				option::none(),
			  	option::none(),
			  option::some(dubhe_bridge_deposit_event::new(asset_id,from,to,from_chain,amount))
			  )
  }
}
