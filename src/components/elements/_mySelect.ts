import Vue from 'vue';
import Component from 'vue-class-component';


@Component({
  props: {
    options: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
})
export default class MySelect extends Vue {

  // from parent
  public title!: string;
  public options!: string[];

  public selectedIndex = -1;
  public hidden = true;
  public isActive = !this.hidden;



  get watchedOptions() {
    // When options change, reset index
    this.selectedIndex = -1;
    return this.options;
  }

  // When user clicks anywhere else on the document
  private _blur!: (ev: MouseEvent) => void;



  public created() {

    this._blur = ((_this: MySelect) => {
      return (ev: MouseEvent) => {
        _this.toggle(ev, true);
      };
    })(this);

    document.addEventListener('click', this._blur);
  }


  public destroyed() {
    document.removeEventListener('click', this._blur);
  }


  public select(i: number) {
    this.selectedIndex = i;
  }


  public toggle(ev: MouseEvent, passive = false) {

    if (passive) this.hidden = true;

    // Stop propogation with active toggle
    else {
      ev.stopImmediatePropagation();
      ev.stopPropagation();
      this.hidden = !this.hidden;
    }

    this.isActive = !this.hidden;

  }
}
