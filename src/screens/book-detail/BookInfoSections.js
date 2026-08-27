import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressBar, MetaRow } from '../../components/ui';
import { NeuShadow } from '../../components/ui/NeuShadow';
import { homeColors, spacing, borderWidth, textSizes, fonts } from '../../theme';

export function DetailDivider() {
  return (
    <View style={dividerStyles.container}>
      <Text style={dividerStyles.text} numberOfLines={1}>{'≻──────────── ⋆✩⋆ ────────────≺'}</Text>
    </View>
  );
}

const dividerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: spacing.xxs,
  },
  text: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 18,
    color: '#000000',
  },
});

function SectionWindow({ title, children, rightAction }) {
  return (
    <NeuShadow offset={3}>
      <View style={windowStyles.frame}>
        <View style={windowStyles.titleBar}>
          <Text style={windowStyles.titleText}>{title}</Text>
          {rightAction}
        </View>
        <View style={windowStyles.content}>
          {children}
        </View>
      </View>
    </NeuShadow>
  );
}

const windowStyles = StyleSheet.create({
  frame: {
    borderWidth: borderWidth.pixel,
    borderColor: homeColors.border,
    backgroundColor: homeColors.bgCard,
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: homeColors.border,
  },
  titleText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: homeColors.textDark,
  },
  content: {
    padding: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
});

export function TagsSection({ bookTags, allTags, onManageTags }) {
  return (
    <SectionWindow
      title="tags.exe"
      rightAction={
        <TouchableOpacity
          onPress={onManageTags}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={tagsBtnStyle.btn}
        >
          <Text style={tagsBtnStyle.text}>+</Text>
        </TouchableOpacity>
      }
    >
      {bookTags.length === 0 ? (
        <Text style={styles.emptyText}>No tags - tap + to add</Text>
      ) : (
        <View style={styles.tagsRow}>
          {bookTags.map(tagId => {
            const tag = allTags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <View key={tagId} style={[styles.tagPill, { backgroundColor: tag.color }]}>
                <Text style={styles.tagPillText}>{tag.label}</Text>
              </View>
            );
          })}
        </View>
      )}
    </SectionWindow>
  );
}

export function ReadingProgressSection({ progress, currentPage, totalPages }) {
  return (
    <SectionWindow title="progress.dat">
      <ProgressBar progress={progress} height={6} />
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{progress}%</Text>
        {currentPage > 0 && totalPages > 0 && (
          <Text style={styles.pageText}>p.{currentPage}/{totalPages}</Text>
        )}
      </View>
    </SectionWindow>
  );
}

export function DescriptionSection({ description }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <SectionWindow title="description.txt">
      <Text style={description ? styles.descText : styles.emptyText} numberOfLines={expanded ? undefined : 6}>
        {description || 'No description available'}
      </Text>
      {description && description.length > 150 && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.readMoreBtn}>
          <Text style={styles.readMoreText}>{expanded ? '▲ Show less' : '▼ Read more'}</Text>
        </TouchableOpacity>
      )}
    </SectionWindow>
  );
}

export function CategoriesSection({ categories }) {
  if (!categories?.length) return null;
  return (
    <SectionWindow title="categories.cfg">
      <View style={styles.chipsRow}>
        {categories.map((cat, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{cat}</Text>
          </View>
        ))}
      </View>
    </SectionWindow>
  );
}

export function PublicationDetails({ book }) {
  return (
    <SectionWindow title="metadata.ini">
      <View style={styles.metaList}>
        <MetaRow icon="domain" label="Publisher" value={book.publisher} />
        <MetaRow icon="calendar" label="Published" value={book.publishedDate} />
        <MetaRow icon="book-open-page-variant" label="Pages" value={book.pageCount > 0 ? String(book.pageCount) : null} />
        <MetaRow icon="translate" label="Language" value={book.language?.toUpperCase()} />
        <MetaRow icon="barcode" label="ISBN" value={book.isbn} />
      </View>
    </SectionWindow>
  );
}

export function LinksSection({ book, onOpenLink }) {
  const hasLinks = book.previewLink || book.infoLink || book.buyLink;
  if (!hasLinks) return null;

  return (
    <SectionWindow title="links.url">
      <View style={styles.linksRow}>
        {book.previewLink && (
          <TouchableOpacity style={styles.linkBtn} onPress={() => onOpenLink(book.previewLink)}>
            <MaterialCommunityIcons name="book-open-variant" size={14} color="#000" />
            <Text style={styles.linkBtnText}>Preview</Text>
          </TouchableOpacity>
        )}
        {book.infoLink && (
          <TouchableOpacity style={styles.linkBtn} onPress={() => onOpenLink(book.infoLink)}>
            <MaterialCommunityIcons name="information" size={14} color="#000" />
            <Text style={styles.linkBtnText}>Info</Text>
          </TouchableOpacity>
        )}
        {book.buyLink && (
          <TouchableOpacity style={[styles.linkBtn, styles.buyBtn]} onPress={() => onOpenLink(book.buyLink)}>
            <MaterialCommunityIcons name="cart" size={14} color="#000" />
            <Text style={styles.linkBtnText}>Buy</Text>
          </TouchableOpacity>
        )}
      </View>
    </SectionWindow>
  );
}

const styles = StyleSheet.create({
  // Tags
  emptyText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: homeColors.textCaption,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tagPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  tagPillText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#FFFFFF',
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxs,
  },
  progressText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xs,
    color: homeColors.textDark,
  },
  pageText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xxs,
    color: homeColors.textCaption,
  },

  // Description
  descText: {
    fontFamily: fonts.body,
    fontSize: textSizes.xs,
    color: homeColors.textBody,
    lineHeight: textSizes.xs * 1.6,
  },
  readMoreBtn: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: '#FBCA1F',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#000000',
  },
  readMoreText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },

  // Categories
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: '#FBCA1F',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#000000',
  },
  chipText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },

  // Metadata
  metaList: {
    gap: spacing.xs,
  },

  // Links
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FBCA1F',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  buyBtn: {
    backgroundColor: homeColors.success,
  },
  linkBtnText: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.xxs,
    color: '#000000',
  },
});


const tagsBtnStyle = StyleSheet.create({
  btn: {
    backgroundColor: '#FBCA1F',
    borderWidth: 2,
    borderColor: '#000000',
    borderRightWidth: 3,
    borderBottomWidth: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: textSizes.md,
    color: '#000000',
  },
});
