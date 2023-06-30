import { Contract } from '@algorandfoundation/tealscript';

// docs: https://tealscript.netlify.app/

class Template extends Contract {
  owner = new GlobalStateKey<Address>({ key: 'owner' });
  counter = new GlobalStateKey<uint64>({ key: 'count' });

  @handle.createApplication
  create(): void {
    this.owner.put(this.txn.sender);
    this.counter.put(0);
  }

  increment(): void {
    assert(this.txn.sender === this.owner.get());
    this.counter.put(this.counter.get() + 1);
  }

  decrement(): void {
    assert(this.txn.sender === this.owner.get());
    assert(this.counter.get() > 0);
    this.counter.put(this.counter.get() - 1);
  }

  @handle.updateApplication
  update(): void {
    assert(this.txn.sender === this.owner.get());
    log('This app has been updated!');
  }

  @handle.deleteApplication
  delete(): void {
    assert(this.txn.sender === this.owner.get());
    log('This app has been deleted!');
  }
}
