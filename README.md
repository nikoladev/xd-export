# Export only one size

This Adobe XD plugin allows you to only export at the size you want. So you don't have to delete the other sizes you never wanted.

Download it [here](https://xd.adobelanding.com/en/xd-plugin-download/?name=ad4d7bf5)

## The reason behind the plugin

In Adobe XD when you use the standard export function to export at a scale of `2x` or `3x` you also get all the scales leading up to it which you then have to delete manually.

For example, if you export 4 files at scale `3x` as a `PNG` you get the following files:

```bash
design-I.png       # ❌ needs to be deleted
design-I@2x.png    # ❌ needs to be deleted
design-I@3x.png    # ✅ this is what we want
design-II.png      # ❌ needs to be deleted
design-II@2x.png   # ❌ needs to be deleted
design-II@3x.png   # ✅ this is what we want
design-III.png     # ❌ needs to be deleted
design-III@2x.png  # ❌ needs to be deleted
design-III@3x.png  # ✅ this is what we want
design-IV.png      # ❌ needs to be deleted
design-IV@2x.png   # ❌ needs to be deleted
design-IV@3x.png   # ✅ this is what we want
```

This is a lot of unnecessary manual work. With this plugin you will only get the files you need:

```bash
design-I@3x.png
design-II@3x.png
design-III@3x.png
design-IV@3x.png
```

## Support

If you need help, want to report a bug, or request a feature you can open up a new issue [here](https://github.com/nikoladev/xd-export/issues).
